import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const { password: _, ...result } = user;
    return result;
  }
  login(user: Omit<User, 'password'>) {
    if (!user?.id || !user?.username) {
      throw new UnauthorizedException('Invalid user payload');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
