import { User } from '../users/user.entity';
export declare class Comment {
    id: number;
    content: string;
    createdAt: Date;
    deletedAt: Date | null;
    user: User;
    parent?: Comment;
    children: Comment[];
}
