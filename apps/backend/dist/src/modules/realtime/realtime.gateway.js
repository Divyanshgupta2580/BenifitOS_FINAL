"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const defaultWsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const authHeader = client.handshake.headers?.authorization;
            const rawToken = client.handshake.auth?.token || client.handshake.query?.token || authHeader;
            if (!rawToken) {
                throw new common_1.UnauthorizedException('Missing WebSocket authentication token.');
            }
            const token = typeof rawToken === 'string' && rawToken.startsWith('Bearer ')
                ? rawToken.slice(7)
                : String(rawToken);
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new common_1.UnauthorizedException('Server JWT configuration missing.');
            }
            const payload = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            client.data.user = payload;
            this.logger.log(`Authenticated WebSocket client connected: ${client.id} (user: ${payload.sub})`);
            client.join(`user:${payload.sub}`);
            this.logger.log(`Socket ${client.id} automatically joined private room user:${payload.sub}`);
            client.emit('connection_ack', {
                status: 'CONNECTED',
                connectionId: client.id,
                userId: payload.sub,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            this.logger.warn(`WebSocket authentication failed for client ${client.id}: ${err.message}`);
            client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or missing authentication token.' });
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected from /ws: ${client.id}`);
    }
    handleUserSubscription(data, client) {
        const authenticatedUserId = client.data.user?.sub;
        const userRole = client.data.user?.role;
        if (!authenticatedUserId) {
            throw new common_1.UnauthorizedException('Unauthenticated socket session.');
        }
        if (data?.userId && (data.userId === authenticatedUserId || ['ADMIN', 'OFFICER'].includes(userRole))) {
            client.join(`user:${data.userId}`);
            this.logger.log(`Socket ${client.id} joined room user:${data.userId}`);
            return { status: 'SUBSCRIBED', room: `user:${data.userId}` };
        }
        else {
            return { status: 'ERROR', message: 'Forbidden: Cannot subscribe to another user room.' };
        }
    }
    emitOcrProgress(userId, progressData) {
        this.server.to(`user:${userId}`).emit('events.ocr_progress', progressData);
    }
    emitApplicationStatus(userId, appData) {
        this.server.to(`user:${userId}`).emit('events.application_status_changed', appData);
    }
    emitNotification(userId, notificationData) {
        this.server.to(`user:${userId}`).emit('events.notification_received', notificationData);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_user'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUserSubscription", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'ws',
        cors: {
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                const configured = process.env.CORS_ORIGIN
                    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
                    : defaultWsOrigins;
                const isAllowed = configured.includes(origin) || defaultWsOrigins.includes(origin);
                if (isAllowed) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by WebSocket CORS'));
                }
            },
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map