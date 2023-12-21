import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from '../common/guards/strategies/local.strategy';
import { JwtStrategy } from '../common/guards/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../common/guards/strategies/jwt-refresh.strategy';
import { SessionSerializer } from '../common/util/session.serializer';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.tokenSecret,
      signOptions: {
        expiresIn: jwtConstants.tokenExpiresIn,
      },
    }),
  ],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    SessionSerializer,
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
