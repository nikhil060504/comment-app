import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCommentDto, user: User) {
    let parent: Comment | null = null;
    if (dto.parentId) {
      parent = await this.commentsRepository.findOne({ where: { id: dto.parentId }, relations: { user: true } });
      if (!parent) throw new NotFoundException('Parent comment not found');
      if (parent.user.id !== user.id) {
        await this.notificationsService.create(parent.user, `You have a new reply to your comment.`);
      }
    }
    const comment = this.commentsRepository.create({
      content: dto.content,
      parent: parent ?? undefined,
      user,
    });
    return this.commentsRepository.save(comment);
  }

  async findThread(rootId: number) {
    const root = await this.commentsRepository.findOne({ where: { id: rootId }, relations: { user: true, children: true } });
    if (!root) throw new NotFoundException('Comment not found');
    // Use arrow function to capture 'this'
    const fetchChildren = async (comment: Comment): Promise<Comment> => {
      const children = await this.commentsRepository.find({ where: { parent: { id: comment.id } }, relations: { user: true, children: true } });
      comment.children = [];
      for (const child of children) {
        comment.children.push(await fetchChildren(child));
      }
      return comment;
    };
    const fullTree = await fetchChildren(root);
    return fullTree;
  }

  async update(id: number, dto: UpdateCommentDto, user: User) {
    const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('Not owner');
    }
    comment.content = dto.content;
    return this.commentsRepository.save(comment);
  }

  async softDelete(id: number, user: User) {
    const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('Not owner');
    }
    comment.deletedAt = new Date();
    return this.commentsRepository.save(comment);
  }

  async restore(id: number, user: User) {
    const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
    if (!comment || !comment.deletedAt) throw new NotFoundException('Cannot restore');
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('Not owner');
    }
    
    comment.deletedAt = null;
    return this.commentsRepository.save(comment);
  }

  async removePermanently() {
    // run periodically by cron/queue to hard delete comments deleted > 15min ago
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('deletedAt IS NOT NULL AND deletedAt < :fifteenMinutesAgo', { fifteenMinutesAgo })
      .execute();
  }
}
