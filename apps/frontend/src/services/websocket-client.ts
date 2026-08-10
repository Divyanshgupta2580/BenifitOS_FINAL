import { io, Socket } from 'socket.io-client';
import { storageService } from './storage.service';

const getWsBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  return 'ws://localhost:4000/ws';
};

class WebSocketService {
  private socket: Socket | null = null;

  async connect(): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = await storageService.getItem('accessToken');
    this.socket = io(getWsBaseUrl(), {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
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
