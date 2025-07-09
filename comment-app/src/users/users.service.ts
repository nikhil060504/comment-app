import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, hashedPassword: string): Promise<User> {
    const user = this.usersRepository.create({ email, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }
}
