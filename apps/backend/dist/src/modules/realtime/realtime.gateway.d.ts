import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AiService } from '../ai/ai.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly aiService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, aiService: AiService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleReauthenticate(data: {
        token: string;
    }, client: Socket): Promise<{
        status: string;
        userId: any;
        message?: undefined;
    } | {
        status: string;
        message: string;
        userId?: undefined;
    }>;
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
    handleRequestGuidance(data: {
        requestId?: string;
        schemeTitle: string;
        schemeId?: string;
        language?: string;
    }, client: Socket): Promise<void>;
    emitOcrProgress(userId: string, progressData: any): void;
    emitApplicationStatus(userId: string, appData: any): void;
    emitNotification(userId: string, notificationData: any): void;
}
