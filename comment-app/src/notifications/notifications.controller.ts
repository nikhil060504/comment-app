import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findForUser(@Req() req: Request) {
    // req.user is set by JwtAuthGuard
    return this.notificationsService.findForUser(req.user as any);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: number) {
    await this.notificationsService.markRead(id);
    return { success: true };
  }
} 