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
describe('Comments (e2e)', () => {
    let app;
    let accessToken;
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
            .send({ email: 'test2@example.com', password: 'password' })
            .expect(201);
        const loginRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'test2@example.com', password: 'password' })
            .expect(200);
        accessToken = loginRes.body.access_token;
    });
    beforeEach(async () => {
        const comments = await app.get(typeorm_1.DataSource).getRepository(comment_entity_1.Comment).find();
        await app.get(typeorm_1.DataSource).getRepository(comment_entity_1.Comment).remove(comments);
    });
    it('should create a root comment and nested replies, and fetch the full thread', async () => {
        const rootRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Root comment' })
            .expect(201);
        const rootId = rootRes.body.id;
        const reply1 = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'First reply', parentId: rootId })
            .expect(201);
        const reply2 = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Second reply', parentId: reply1.body.id })
            .expect(201);
        const threadRes = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/comments/${rootId}/thread`)
            .expect(200);
        console.log(JSON.stringify(threadRes.body, null, 2));
        expect(threadRes.body.content).toBe('Root comment');
        expect(threadRes.body.children[0].content).toBe('First reply');
        expect(threadRes.body.children[0].children[0].content).toBe('Second reply');
    });
    it('should allow editing a comment within 15 minutes', async () => {
        const commentRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Editable comment' })
            .expect(201);
        const commentId = commentRes.body.id;
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Edited comment' })
            .expect(200);
    });
    it('should allow soft delete and restore within 15 minutes', async () => {
        const commentRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'To be deleted' })
            .expect(201);
        const commentId = commentRes.body.id;
        await (0, supertest_1.default)(app.getHttpServer())
            .delete(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/comments/${commentId}/restore`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });
});
//# sourceMappingURL=comments.e2e-spec.js.map