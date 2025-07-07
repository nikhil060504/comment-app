import { Comment } from '../comments/comment.entity';
import { Notification } from '../notifications/notification.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    comments: Comment[];
    notifications: Notification[];
}
