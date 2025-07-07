import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    create(recipient: User, message: string): Promise<Notification>;
    findForUser(user: User): Promise<Notification[]>;
    markRead(id: number): Promise<void>;
}
