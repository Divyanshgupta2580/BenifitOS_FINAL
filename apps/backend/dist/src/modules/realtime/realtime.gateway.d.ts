import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleUserSubscription(data: {
        userId: string;
    }, client: Socket): {
        status: string;
        room: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
        room?: undefined;
    };
    emitOcrProgress(userId: string, progressData: any): void;
    emitApplicationStatus(userId: string, appData: any): void;
    emitNotification(userId: string, notificationData: any): void;
}
