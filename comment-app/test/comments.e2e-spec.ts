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

describe('Comments (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
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
    // Sign up and login a user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test2@example.com', password: 'password' })
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test2@example.com', password: 'password' })
      .expect(200);
    accessToken = loginRes.body.access_token;
  });

  beforeEach(async () => {
    const comments = await app.get(DataSource).getRepository(Comment).find();
    await app.get(DataSource).getRepository(Comment).remove(comments);
  });

  it('should create a root comment and nested replies, and fetch the full thread', async () => {
    // Create root comment
    const rootRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Root comment' })
      .expect(201);
    const rootId = rootRes.body.id;
    // Create first-level reply
    const reply1 = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'First reply', parentId: rootId })
      .expect(201);
    // Create second-level reply
    const reply2 = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Second reply', parentId: reply1.body.id })
      .expect(201);
    // Fetch thread
    const threadRes = await request(app.getHttpServer())
      .get(`/comments/${rootId}/thread`)
      .expect(200);
    console.log(JSON.stringify(threadRes.body, null, 2));
    expect(threadRes.body.content).toBe('Root comment');
    expect(threadRes.body.children[0].content).toBe('First reply');
    expect(threadRes.body.children[0].children[0].content).toBe('Second reply');
  });

  it('should allow editing a comment within 15 minutes', async () => {
    const commentRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Editable comment' })
      .expect(201);
    const commentId = commentRes.body.id;
    await request(app.getHttpServer())
      .patch(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Edited comment' })
      .expect(200);
  });

  it('should allow soft delete and restore within 15 minutes', async () => {
    const commentRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'To be deleted' })
      .expect(201);
    const commentId = commentRes.body.id;
    await request(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/comments/${commentId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
}); 