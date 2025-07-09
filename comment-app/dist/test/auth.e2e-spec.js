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
console.log('JWT_SECRET in test:', process.env.JWT_SECRET);
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/users/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const comment_entity_1 = require("../src/comments/comment.entity");
const notification_entity_1 = require("../src/notifications/notification.entity");
describe('Auth (e2e)', () => {
    let app;
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
    });
    beforeEach(async () => {
        const users = await app.get(typeorm_1.DataSource).getRepository(user_entity_1.User).find();
        await app.get(typeorm_1.DataSource).getRepository(user_entity_1.User).remove(users);
    });
    it('/auth/signup (POST)', () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'test@example.com', password: 'password' })
            .expect(201)
            .then((res) => {
            expect(res.body).toHaveProperty('access_token');
        });
    });
    it('/auth/login (POST)', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'test@example.com', password: 'password' })
            .expect(201);
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'password' })
            .expect(200)
            .then((res) => {
            expect(res.body).toHaveProperty('access_token');
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map