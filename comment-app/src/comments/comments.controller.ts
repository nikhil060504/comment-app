import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @Req() req: Request) {
    return this.commentsService.create(dto, req.user as any);
  }

  @Get(':id/thread')
  thread(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findThread(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto, @Req() req: Request) {
    return this.commentsService.update(id, dto, req.user as any);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.commentsService.softDelete(id, req.user as any);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.commentsService.restore(id, req.user as any);
  }
}
