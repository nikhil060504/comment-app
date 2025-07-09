"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./comment.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let CommentsService = class CommentsService {
    constructor(commentsRepository, notificationsService) {
        this.commentsRepository = commentsRepository;
        this.notificationsService = notificationsService;
    }
    async create(dto, user) {
        let parent = null;
        if (dto.parentId) {
            parent = await this.commentsRepository.findOne({ where: { id: dto.parentId }, relations: { user: true } });
            if (!parent)
                throw new common_1.NotFoundException('Parent comment not found');
            if (parent.user.id !== user.id) {
                await this.notificationsService.create(parent.user, `You have a new reply to your comment.`);
            }
        }
        const comment = this.commentsRepository.create({
            content: dto.content,
            parent: parent !== null && parent !== void 0 ? parent : undefined,
            user,
        });
        return this.commentsRepository.save(comment);
    }
    async findThread(rootId) {
        const root = await this.commentsRepository.findOne({ where: { id: rootId }, relations: { user: true, children: true } });
        if (!root)
            throw new common_1.NotFoundException('Comment not found');
        const fetchChildren = async (comment) => {
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
    async update(id, dto, user) {
        const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.user.id !== user.id) {
            throw new common_1.ForbiddenException('Not owner');
        }
        comment.content = dto.content;
        return this.commentsRepository.save(comment);
    }
    async softDelete(id, user) {
        const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.user.id !== user.id) {
            throw new common_1.ForbiddenException('Not owner');
        }
        comment.deletedAt = new Date();
        return this.commentsRepository.save(comment);
    }
    async restore(id, user) {
        const comment = await this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
        if (!comment || !comment.deletedAt)
            throw new common_1.NotFoundException('Cannot restore');
        if (comment.user.id !== user.id) {
            throw new common_1.ForbiddenException('Not owner');
        }
        comment.deletedAt = null;
        return this.commentsRepository.save(comment);
    }
    async removePermanently() {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        await this.commentsRepository
            .createQueryBuilder()
            .delete()
            .from(comment_entity_1.Comment)
            .where('deletedAt IS NOT NULL AND deletedAt < :fifteenMinutesAgo', { fifteenMinutesAgo })
            .execute();
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map