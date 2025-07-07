"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const comments_module_1 = require("./comments/comments.module");
const notifications_module_1 = require("./notifications/notifications.module");
const user_entity_1 = require("./users/user.entity");
const comment_entity_1 = require("./comments/comment.entity");
const notification_entity_1 = require("./notifications/notification.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    var _a;
                    return ({
                        type: 'postgres',
                        host: process.env.DATABASE_HOST,
                        port: parseInt((_a = process.env.DATABASE_PORT) !== null && _a !== void 0 ? _a : '5432', 10),
                        username: process.env.DATABASE_USER,
                        password: process.env.DATABASE_PASSWORD,
                        database: process.env.DATABASE_NAME,
                        entities: [user_entity_1.User, comment_entity_1.Comment, notification_entity_1.Notification],
                        synchronize: true
                    });
                },
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST,
                    port: parseInt((_a = process.env.REDIS_PORT) !== null && _a !== void 0 ? _a : '6379', 10),
                },
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            comments_module_1.CommentsModule,
            notifications_module_1.NotificationsModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map