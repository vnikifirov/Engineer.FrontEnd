import { Injectable } from '@nestjs/common';
import { User } from '@challenge/api-interfaces';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      email: 'demo',
      password: 'demo',
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
