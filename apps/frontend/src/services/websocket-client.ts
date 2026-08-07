import { io, Socket } from 'socket.io-client';
import { storageService } from './storage.service';

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

class WebSocketService {
  private socket: Socket | null = null;

  async connect(): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = await storageService.getItem('accessToken');
    this.socket = io(WS_BASE_URL, {
      auth: { token },
      query: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Connected to BenefitOS Realtime Gateway /ws');
    });

    this.socket.io.on('reconnect_attempt', async () => {
      const latestToken = await storageService.getItem('accessToken');
      if (this.socket) {
        this.socket.auth = { token: latestToken };
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚡ Disconnected from Realtime Gateway:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();
