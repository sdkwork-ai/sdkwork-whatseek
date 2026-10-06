/**
 * Mini-program transport host adapters for the sdkwork-im driver
 * (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md §Host adapters: only the bootstrap
 * layer binds `wx.*`; capability packages consume typed ports).
 *
 * `@sdkwork/im-sdk` talks REST through the runtime `fetch` and realtime CCP
 * through an injected WebSocket factory. The WeChat runtime provides neither:
 * the composition root (`src/bootstrap/runtime.ts`) binds these adapters to
 * `wx.request` / `wx.connectSocket` through the typed ports below and installs
 * the fetch polyfill before constructing the composed IM client. The adapter
 * logic itself is pure — it only sees the typed ports, so it unit-tests
 * without the WeChat runtime.
 */

/** Subset of the `wx.request` task surface the fetch polyfill needs. */
export interface MiniProgramRequestTaskPort {
  abort(): void;
}

/** Typed `wx.request` surface (options/shape per the WeChat runtime contract). */
export interface MiniProgramRequestPort {
  request(options: {
    url: string;
    method?: string;
    header?: Record<string, string>;
    data?: string;
    responseType?: 'text' | 'arraybuffer';
    dataType?: 'text' | string;
    timeout?: number;
    success(res: { statusCode: number; header: Record<string, string>; data: string | ArrayBuffer }): void;
    fail(err: { errMsg?: string }): void;
  }): MiniProgramRequestTaskPort;
}

/** Typed `wx.connectSocket` surface (SocketTask + entrypoint). */
export interface MiniProgramSocketTaskPort {
  /** WeChat SocketTask readyState (0 connecting, 1 open, 2 closing, 3 closed). */
  readonly readyState?: number;
  send(options: { data: string }): void;
  close(options?: { code?: number; reason?: string }): void;
  onOpen(callback: () => void): void;
  onMessage(callback: (res: { data: string | ArrayBuffer }) => void): void;
  onClose(callback: (res: { code?: number; reason?: string }) => void): void;
  onError(callback: (res: { errMsg?: string }) => void): void;
}

export interface MiniProgramWebSocketPort {
  connectSocket(options: {
    url: string;
    protocols?: string[];
    header?: Record<string, string>;
  }): MiniProgramSocketTaskPort;
}

const WEBSOCKET_OPEN = 1;

/** Minimal `Response` surface `@sdkwork/sdk-common` BaseHttpClient consumes. */
class MiniProgramFetchResponse {
  readonly status: number;
  readonly statusText: string;
  private readonly headerMap: Record<string, string>;
  private readonly bodyText: string;

  constructor(status: number, headerMap: Record<string, string>, bodyText: string) {
    this.status = status;
    this.statusText = status >= 200 && status < 300 ? 'OK' : 'Request failed';
    this.headerMap = headerMap;
    this.bodyText = bodyText;
  }

  get ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  get headers(): { get(name: string): string | null } {
    const headerMap = this.headerMap;
    return {
      get(name: string): string | null {
        const lower = name.toLowerCase();
        for (const [key, value] of Object.entries(headerMap)) {
          if (key.toLowerCase() === lower) {
            return value;
          }
        }
        return null;
      },
    };
  }

  async text(): Promise<string> {
    return this.bodyText;
  }

  async json(): Promise<unknown> {
    return JSON.parse(this.bodyText) as unknown;
  }
}

function abortError(message: string): Error {
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}

/**
 * Build a fetch implementation over the typed `wx.request` port. Not installed
 * automatically — the composition root assigns it to `globalThis.fetch` when
 * the runtime has none (see `installMiniProgramFetchPolyfill`).
 */
export function createMiniProgramFetch(request: MiniProgramRequestPort): typeof fetch {
  return ((input, init) =>
    new Promise((resolve, reject) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const headers = (init?.headers ?? {}) as Record<string, string>;
      const body = typeof init?.body === 'string' ? init.body : undefined;
      const signal = init?.signal ?? undefined;
      let aborted = false;

      const task = request.request({
        url,
        method: init?.method ?? 'GET',
        header: headers,
        ...(body !== undefined ? { data: body } : {}),
        responseType: 'text',
        dataType: 'text',
        success: (res) => {
          const bodyText = typeof res.data === 'string' ? res.data : '';
          resolve(new MiniProgramFetchResponse(res.statusCode, res.header ?? {}, bodyText) as unknown as Response);
        },
        fail: (err) => {
          if (aborted || signal?.aborted) {
            reject(abortError('Request was cancelled'));
            return;
          }
          reject(new TypeError(err?.errMsg ?? 'wx.request failed'));
        },
      });

      if (signal !== undefined) {
        if (signal.aborted) {
          aborted = true;
          task.abort();
          reject(abortError('Request was cancelled'));
          return;
        }
        signal.addEventListener('abort', () => {
          aborted = true;
          task.abort();
        });
      }
    })) as typeof fetch;
}

/**
 * Install the wx.request-backed fetch when the runtime has none, together with
 * a minimal AbortController when the host lacks one (the generated HTTP client
 * drives request timeouts through AbortSignal). Returns whether anything was
 * installed.
 */
export function installMiniProgramFetchPolyfill(request: MiniProgramRequestPort): boolean {
  const globalRef = globalThis as {
    fetch?: unknown;
    AbortController?: unknown;
    AbortSignal?: unknown;
  };
  const installed = { fetch: false, abort: false };
  if (typeof globalRef.fetch !== 'function') {
    globalRef.fetch = createMiniProgramFetch(request);
    installed.fetch = true;
  }
  if (typeof globalRef.AbortController !== 'function' || typeof globalRef.AbortSignal !== 'function') {
    installMinimalAbortController(globalRef);
    installed.abort = true;
  }
  return installed.fetch || installed.abort;
}

function installMinimalAbortController(globalRef: {
  AbortController?: unknown;
  AbortSignal?: unknown;
}): void {
  class MinimalAbortSignal {
    private abortedFlag = false;
    private listeners = new Set<() => void>();

    get aborted(): boolean {
      return this.abortedFlag;
    }

    addEventListener(_type: 'abort', listener: () => void): void {
      this.listeners.add(listener);
    }

    removeEventListener(_type: 'abort', listener: () => void): void {
      this.listeners.delete(listener);
    }

    trigger(): void {
      if (this.abortedFlag) {
        return;
      }
      this.abortedFlag = true;
      for (const listener of [...this.listeners]) {
        listener();
      }
    }
  }

  class MinimalAbortController {
    readonly signal = new MinimalAbortSignal();

    abort(): void {
      this.signal.trigger();
    }
  }

  globalRef.AbortSignal = MinimalAbortSignal as unknown;
  globalRef.AbortController = MinimalAbortController as unknown;
}

/**
 * Build the `ImWebSocketFactory`-shaped factory over the typed
 * `wx.connectSocket` port (structural match for `@sdkwork/im-sdk`'s
 * `ImWebSocketLike`: readyState + event listeners + send/close).
 */
export function createMiniProgramWebSocketFactory(
  sockets: MiniProgramWebSocketPort,
): (url: string, options: { headers: Record<string, string>; protocols: string[] }) => {
  readyState: number;
  addEventListener(type: 'open' | 'message' | 'close' | 'error', handler: (event: unknown) => void): void;
  close(code?: number, reason?: string): void;
  send(value: string): void;
} {
  return (url, options) => {
    const task = sockets.connectSocket({
      url,
      ...(options.protocols.length > 0 ? { protocols: options.protocols } : {}),
      ...(Object.keys(options.headers).length > 0 ? { header: options.headers } : {}),
    });

    // wx.SocketTask only exposes the typed on* callbacks; translate them into
    // the addEventListener surface the SDK adapts. readyState proxies the
    // SocketTask when the host provides it, defaulting to OPEN so the SDK's
    // pre-open reads never see a misleading CONNECTING.
    const readyStateRef = {
      value: task.readyState ?? WEBSOCKET_OPEN,
    };
    return {
      get readyState(): number {
        return task.readyState ?? readyStateRef.value;
      },
      addEventListener(type, handler) {
        switch (type) {
          case 'open':
            task.onOpen(() => handler({ type: 'open' }));
            break;
          case 'message':
            task.onMessage((res) => handler({ type: 'message', data: res.data }));
            break;
          case 'close':
            task.onClose((res) => {
              readyStateRef.value = 3;
              handler({ type: 'close', code: res.code, reason: res.reason });
            });
            break;
          case 'error':
            task.onError((res) => handler({ type: 'error', errMsg: res.errMsg }));
            break;
        }
      },
      close(code, reason) {
        readyStateRef.value = 3;
        task.close({ code, reason });
      },
      send(value) {
        task.send({ data: value });
      },
    };
  };
}
