import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommentsService {
    private commentsRepository;
    private notificationsService;
    constructor(commentsRepository: Repository<Comment>, notificationsService: NotificationsService);
    create(dto: CreateCommentDto, user: User): Promise<Comment>;
    findThread(rootId: number): Promise<Comment>;
    update(id: number, dto: UpdateCommentDto, user: User): Promise<Comment>;
    softDelete(id: number, user: User): Promise<Comment>;
    restore(id: number, user: User): Promise<Comment>;
    removePermanently(): Promise<void>;
}
