import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(recipient: User, message: string) {
    const n = this.notificationsRepository.create({ recipient, message });
    return this.notificationsRepository.save(n);
  }

  async findForUser(user: User) {
    return this.notificationsRepository.find({ where: { recipient: { id: user.id } } });
  }

  async markRead(id: number) {
    await this.notificationsRepository.update(id, { read: true });
  }
}
