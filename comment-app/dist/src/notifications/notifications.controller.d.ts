import { NotificationsService } from './notifications.service';
import { Request } from 'express';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findForUser(req: Request): Promise<import("./notification.entity").Notification[]>;
    markRead(id: number): Promise<{
        success: boolean;
    }>;
}
