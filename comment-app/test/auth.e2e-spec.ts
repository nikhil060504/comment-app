import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
console.log('JWT_SECRET in test:', process.env.JWT_SECRET);
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../src/comments/comment.entity';
import { Notification } from '../src/notifications/notification.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;
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
  });

  beforeEach(async () => {
    const users = await app.get(DataSource).getRepository(User).find();
    await app.get(DataSource).getRepository(User).remove(users);
  });

  it('/auth/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/login (POST)', async () => {
    // First, sign up the user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201);

    // Then, try to log in
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });
});
