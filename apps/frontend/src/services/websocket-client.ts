import { io, Socket } from 'socket.io-client';
import { storageService } from './storage.service';
import { aiApiService } from './ai.service';

export type WsConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface SchemeGuidanceResult {
  instructions: string;
  applicationUrl: string;
  schemeTitle: string;
  isCached?: boolean;
}

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

  /**
   * Resilient AI scheme guidance request.
   * Attempts WebSocket real-time delivery with correlation ID first;
   * automatically falls back to HTTP API if WebSocket is offline or times out.
   */
  async requestSchemeGuidance(
    params: {
      schemeTitle: string;
      schemeId?: string;
      language?: string;
      abortSignal?: AbortSignal;
      timeoutMs?: number;
    },
  ): Promise<SchemeGuidanceResult> {
    const { schemeTitle, schemeId, language, abortSignal, timeoutMs = 20000 } = params;
    const requestId = `ws_req_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    // 1. Check if socket is connected or attempt connecting
    let socket = this.socket;
    if (!socket || !socket.connected) {
      try {
        socket = await this.connect();
      } catch {
        socket = null;
      }
    }

    // Fallback directly to HTTP if WebSocket cannot connect
    if (!socket || !socket.connected) {
      console.log('[WebSocket] WS unavailable, using resilient HTTP fallback for guidance');
      return await aiApiService.getSchemeInstructions({ schemeTitle, schemeId });
    }

    return new Promise<SchemeGuidanceResult>((resolve, reject) => {
      let isSettled = false;
      let timeoutHandle: any = null;

      const cleanup = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (socket) {
          socket.off('guidance_cached', handleSuccess);
          socket.off('guidance_completed', handleSuccess);
          socket.off('guidance_failed', handleFailure);
        }
        if (abortSignal) {
          abortSignal.removeEventListener('abort', handleAbort);
        }
      };

      const handleSuccess = (data: any) => {
        if (data && data.requestId === requestId) {
          if (isSettled) return;
          isSettled = true;
          cleanup();
          resolve({
            instructions: data.instructions,
            applicationUrl: data.applicationUrl || 'https://www.india.gov.in/my-government/schemes',
            schemeTitle: data.schemeTitle || schemeTitle,
            isCached: Boolean(data.isCached),
          });
        }
      };

      const handleFailure = (data: any) => {
        if (data && data.requestId === requestId) {
          if (isSettled) return;
          isSettled = true;
          cleanup();
          // Fallback to HTTP on socket error
          console.warn('[WebSocket] Guidance WS failed, attempting HTTP fallback...');
          aiApiService
            .getSchemeInstructions({ schemeTitle, schemeId })
            .then(resolve)
            .catch(reject);
        }
      };

      const handleAbort = () => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
      };

      if (abortSignal) {
        if (abortSignal.aborted) {
          return handleAbort();
        }
        abortSignal.addEventListener('abort', handleAbort);
      }

      // Attach listeners
      socket.on('guidance_cached', handleSuccess);
      socket.on('guidance_completed', handleSuccess);
      socket.on('guidance_failed', handleFailure);

      // Set timeout fallback to HTTP
      timeoutHandle = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          console.warn('[WebSocket] WS guidance timed out, falling back to HTTP...');
          aiApiService
            .getSchemeInstructions({ schemeTitle, schemeId })
            .then(resolve)
            .catch(reject);
        }
      }, timeoutMs);

      // Emit request
      socket.emit('request_guidance', {
        requestId,
        schemeTitle,
        schemeId,
        language,
      });
    });
  }
}

export const wsService = new WebSocketService();
