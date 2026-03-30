import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginSession, LoginSessionDocument } from './schemas/login-session.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(LoginSession.name)
    private readonly loginSessionModel: Model<LoginSessionDocument>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      userName: user.userName,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.loginSessionModel.create({
      userId: user._id.toString(),
      userName: user.userName,
      email: user.email,
      accessToken,
      refreshToken,
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    };
  }

  async logout(userId: string) {
    await this.loginSessionModel.deleteOne({ userId }).exec();
    return { message: 'Logout successful' };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return { user };
  }
}
