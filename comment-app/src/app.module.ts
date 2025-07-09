import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './users/user.entity';
import { Comment } from './comments/comment.entity';
import { Notification } from './notifications/notification.entity';

const imports = [
  ConfigModule.forRoot(),
  BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
  }),
  UsersModule,
  AuthModule,
  CommentsModule,
  NotificationsModule,
];

if (process.env.JEST_WORKER_ID === undefined) {
  imports.push(
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [User, Comment, Notification],
        synchronize: true,
      }),
    }),
  );
}

@Module({
  imports,
})
export class AppModule {}
