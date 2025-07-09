import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    create(dto: CreateCommentDto, req: Request): Promise<import("./comment.entity").Comment>;
    thread(id: number): Promise<import("./comment.entity").Comment>;
    update(id: number, dto: UpdateCommentDto, req: Request): Promise<import("./comment.entity").Comment>;
    softDelete(id: number, req: Request): Promise<import("./comment.entity").Comment>;
    restore(id: number, req: Request): Promise<import("./comment.entity").Comment>;
}
