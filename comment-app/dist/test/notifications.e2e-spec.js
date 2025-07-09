"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/users/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const comment_entity_1 = require("../src/comments/comment.entity");
const notification_entity_1 = require("../src/notifications/notification.entity");
describe('Notifications (e2e)', () => {
    let app;
    let user1Token;
    let user2Token;
    let user1Id;
    let user2Id;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                app_module_1.AppModule,
                typeorm_2.TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [user_entity_1.User, comment_entity_1.Comment, notification_entity_1.Notification],
                    synchronize: true,
                }),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'notify1@example.com', password: 'password' })
            .expect(201);
        const loginRes1 = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'notify1@example.com', password: 'password' })
            .expect(200);
        user1Token = loginRes1.body.access_token;
        const user1 = await app.get(typeorm_1.DataSource).getRepository(user_entity_1.User).findOne({ where: { email: 'notify1@example.com' } });
        user1Id = user1.id;
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'notify2@example.com', password: 'password' })
            .expect(201);
        const loginRes2 = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'notify2@example.com', password: 'password' })
            .expect(200);
        user2Token = loginRes2.body.access_token;
        const user2 = await app.get(typeorm_1.DataSource).getRepository(user_entity_1.User).findOne({ where: { email: 'notify2@example.com' } });
        user2Id = user2.id;
    });
    beforeEach(async () => {
        const notifications = await app.get(typeorm_1.DataSource).getRepository(notification_entity_1.Notification).find();
        await app.get(typeorm_1.DataSource).getRepository(notification_entity_1.Notification).remove(notifications);
        const comments = await app.get(typeorm_1.DataSource).getRepository(comment_entity_1.Comment).find();
        await app.get(typeorm_1.DataSource).getRepository(comment_entity_1.Comment).remove(comments);
    });
    it('should create a notification when a user replies to another user', async () => {
        const rootRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ content: 'Root comment' })
            .expect(201);
        const rootId = rootRes.body.id;
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ content: 'Reply from user2', parentId: rootId })
            .expect(201);
        const notifRes = await (0, supertest_1.default)(app.getHttpServer())
            .get('/notifications')
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        expect(notifRes.body.length).toBeGreaterThan(0);
        expect(notifRes.body[0].message).toContain('You have a new reply');
        expect(notifRes.body[0].read).toBe(false);
    });
    it('should allow marking a notification as read', async () => {
        const rootRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ content: 'Root comment' })
            .expect(201);
        const rootId = rootRes.body.id;
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ content: 'Reply from user2', parentId: rootId })
            .expect(201);
        const notifRes = await (0, supertest_1.default)(app.getHttpServer())
            .get('/notifications')
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        const notifId = notifRes.body[0].id;
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/notifications/${notifId}/read`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        const notifRes2 = await (0, supertest_1.default)(app.getHttpServer())
            .get('/notifications')
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);
        expect(notifRes2.body[0].read).toBe(true);
    });
});
//# sourceMappingURL=notifications.e2e-spec.js.map