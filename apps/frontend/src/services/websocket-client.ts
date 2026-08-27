import { io, Socket } from 'socket.io-client';
import { storageService } from './storage.service';

export type WsConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

const getWsBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) {
    const raw = import.meta.env.VITE_WS_URL;
    return raw.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:');
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:4000/ws';
    }
    return 'https://benefitos-backend-1dq1.onrender.com/ws';
  }
  return 'https://benefitos-backend-1dq1.onrender.com/ws';
};

class WebSocketService {
  private socket: Socket | null = null;
  private status: WsConnectionStatus = 'DISCONNECTED';
  private listeners: Set<(status: WsConnectionStatus) => void> = new Set();
  private isConnecting = false;

  public getStatus(): WsConnectionStatus {
    return this.status;
  }

  public subscribeStatus(listener: (status: WsConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(newStatus: WsConnectionStatus) {
    this.status = newStatus;
    this.listeners.forEach((listener) => {
      try {
        listener(newStatus);
      } catch (err) {
        console.error('[WebSocket] Status listener error:', err);
      }
    });
  }

  async connect(): Promise<Socket | null> {
    if (this.socket && this.socket.connected) {
      this.setStatus('CONNECTED');
      return this.socket;
    }

    if (this.isConnecting && this.socket) {
      return this.socket;
    }

    this.isConnecting = true;
    this.setStatus('CONNECTING');

    try {
      const token = await storageService.getItem('accessToken');
      if (!token) {
        this.setStatus('DISCONNECTED');
        this.isConnecting = false;
        return null;
      }

      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      const url = getWsBaseUrl();
      this.socket = io(url, {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.isConnecting = false;
        this.setStatus('CONNECTED');
        console.log('[WebSocket] Connected to BenefitOS Realtime Gateway (/ws)');
      });

      this.socket.on('connection_ack', (ack) => {
        console.log('[WebSocket] Connection acknowledged:', ack);
        this.setStatus('CONNECTED');
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnecting = false;
        this.setStatus('DISCONNECTED');
        console.log('[WebSocket] Disconnected from Realtime Gateway:', reason);
      });

      this.socket.on('connect_error', (error) => {
        this.isConnecting = false;
        this.setStatus('ERROR');
        console.warn('[WebSocket] Realtime Gateway connection error:', error.message);
      });

      this.socket.io.on('reconnect_attempt', async () => {
        this.setStatus('CONNECTING');
        const latestToken = await storageService.getItem('accessToken');
        if (this.socket && latestToken) {
          this.socket.auth = { token: latestToken };
        }
      });

      return this.socket;
    } catch (err: any) {
      this.isConnecting = false;
      this.setStatus('ERROR');
      console.warn('[WebSocket] Connection initialization failed:', err);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.setStatus('DISCONNECTED');
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();
