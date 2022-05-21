import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Jwt, User } from '@challenge/api-interfaces';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(username);

    if (user && user.password === pass) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async login(user: Partial<User>): Promise<Jwt> {
    const payload = { email: user.email, sub: user.userId };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
