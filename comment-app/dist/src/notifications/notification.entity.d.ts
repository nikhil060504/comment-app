import { User } from '../users/user.entity';
export declare class Notification {
    id: number;
    recipient: User;
    message: string;
    read: boolean;
    createdAt: Date;
}
