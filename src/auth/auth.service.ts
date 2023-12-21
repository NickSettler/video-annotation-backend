import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { jwtConstants } from './constants';
import parse from 'parse-duration';
import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user by username/email and password
   * @param usernameOrEmail username or email
   * @param password password
   */
  public async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOne({
      where: [
        {
          [E_USER_ENTITY_KEYS.USERNAME]: usernameOrEmail,
        },
        {
          [E_USER_ENTITY_KEYS.EMAIL]: usernameOrEmail,
        },
      ],
    });

    if (user && compareSync(password, user[E_USER_ENTITY_KEYS.PASSWORD])) {
      return user;
    }

    return null;
  }

  /**
   * Generate access token cookie
   * @param user user entity
   */
  public generateAccessTokenCookie(user: any) {
    const payload = { userId: user[E_USER_ENTITY_KEYS.ID] };

    const token = this.jwtService.sign(payload);

    const expires = new Date(
      Date.now() + parse(jwtConstants.tokenExpiresIn),
    ).toUTCString();

    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${jwtConstants.tokenExpiresIn}; Expires=${expires}`;

    return {
      cookie,
      token,
    };
  }

  /**
   * Generate refresh token cookie
   * @param user user entity
   */
  public generateRefreshTokenCookie(user: any) {
    const payload = { userId: user[E_USER_ENTITY_KEYS.ID] };

    const token = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });

    const expires = new Date(
      Date.now() + parse(jwtConstants.tokenExpiresIn),
    ).toUTCString();

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${jwtConstants.refreshExpiresIn}; Expires=${expires}`;

    return {
      cookie,
      token,
    };
  }
}
