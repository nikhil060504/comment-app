import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../src/comments/comment.entity';
import { Notification } from '../src/notifications/notification.entity';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let user1Id: number;
  let user2Id: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Comment, Notification],
          synchronize: true,
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Sign up and login two users
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'notify1@example.com', password: 'password' })
      .expect(201);
    const loginRes1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notify1@example.com', password: 'password' })
      .expect(200);
    user1Token = loginRes1.body.access_token;
    // Get user1 id
    const user1 = await app.get(DataSource).getRepository(User).findOne({ where: { email: 'notify1@example.com' } });
    user1Id = user1!.id;

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'notify2@example.com', password: 'password' })
      .expect(201);
    const loginRes2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notify2@example.com', password: 'password' })
      .expect(200);
    user2Token = loginRes2.body.access_token;
    const user2 = await app.get(DataSource).getRepository(User).findOne({ where: { email: 'notify2@example.com' } });
    user2Id = user2!.id;
  });

  beforeEach(async () => {
    const notifications = await app.get(DataSource).getRepository(Notification).find();
    await app.get(DataSource).getRepository(Notification).remove(notifications);
    const comments = await app.get(DataSource).getRepository(Comment).find();
    await app.get(DataSource).getRepository(Comment).remove(comments);
  });

  it('should create a notification when a user replies to another user', async () => {
    // User1 creates a root comment
    const rootRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' })
      .expect(201);
    const rootId = rootRes.body.id;
    // User2 replies to User1's comment
    await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Reply from user2', parentId: rootId })
      .expect(201);
    // User1 fetches notifications
    const notifRes = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
    expect(notifRes.body.length).toBeGreaterThan(0);
    expect(notifRes.body[0].message).toContain('You have a new reply');
    expect(notifRes.body[0].read).toBe(false);
  });

  it('should allow marking a notification as read', async () => {
    // User1 creates a root comment
    const rootRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Root comment' })
      .expect(201);
    const rootId = rootRes.body.id;
    // User2 replies to User1's comment
    await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Reply from user2', parentId: rootId })
      .expect(201);
    // User1 fetches notifications
    const notifRes = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
    const notifId = notifRes.body[0].id;
    // User1 marks notification as read
    await request(app.getHttpServer())
      .patch(`/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
    // Fetch again to confirm
    const notifRes2 = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
    expect(notifRes2.body[0].read).toBe(true);
  });
}); 