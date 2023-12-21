import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import parse from 'parse-duration';
import { jwtConstants } from './constants';
import { SignUpDTO } from './auth.dto';
import {
  handleCustomError,
  isCustomError,
  isError,
} from '../common/util/errors';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async signIn(@Req() request: Request, @Res() response: Response) {
    const accessToken = this.authService.generateAccessTokenCookie(
      request.user,
    );
    const refreshToken = this.authService.generateRefreshTokenCookie(
      request.user,
    );

    await this.usersService.setRefreshToken(
      (request.user as User)[E_USER_ENTITY_KEYS.ID],
      refreshToken.token,
    );

    response.setHeader('Set-Cookie', [accessToken.cookie, refreshToken.cookie]);

    response
      .send({
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        expiresIn: parse(jwtConstants.tokenExpiresIn),
      })
      .end();
  }

  @Post('sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  public async signUp(
    @Body() registerDto: SignUpDTO,
    @Res() response: Response,
  ) {
    const user = await this.usersService
      .create({
        ...registerDto,
      })
      .catch((err: any) => {
        if (isError(err, 'UNIQUE_CONSTRAINT'))
          throw new ConflictException('User already exists');
        else if (isCustomError(err))
          throw new HttpException(...handleCustomError(err));

        throw new InternalServerErrorException("Can't create user");
      });

    const accessToken = this.authService.generateAccessTokenCookie(user);

    const refreshToken = this.authService.generateRefreshTokenCookie(user);

    response.setHeader('Set-Cookie', [accessToken.cookie, refreshToken.cookie]);

    await this.usersService.setRefreshToken(
      user[E_USER_ENTITY_KEYS.ID],
      refreshToken.token,
    );

    response
      .send({
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        expiresIn: parse(jwtConstants.tokenExpiresIn),
      })
      .end();
  }
}
