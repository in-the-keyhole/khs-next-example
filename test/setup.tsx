import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// Global mocks – these run before every test file via setupFilesAfterEnv.
// ---------------------------------------------------------------------------

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  },
  NextResponse: {
    json: (data: unknown, options?: { status?: number }) => ({
      json: async () => data,
      status: options?.status ?? 200,
    }),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// ---------------------------------------------------------------------------
// Session bridge mocks – shared refs consumed by test/session-bridge.tsx
// ---------------------------------------------------------------------------

// Expose mock fns on globalThis so the session-bridge module can reference them
// without needing jest.mock (which doesn't hoist in non-test files).
const _sessionBridgeState = {
  session: null as unknown,
  status: 'unauthenticated' as string,
  signIn: jest.fn(),
  signOut: jest.fn(),
  getServerSession: jest.fn(),
};

(globalThis as Record<string, unknown>).__sessionBridge = _sessionBridgeState;

// Mock next-auth/react – reads from the shared state set by renderWithSession()
jest.mock('next-auth/react', () => {
  const bridge = (globalThis as Record<string, unknown>).__sessionBridge as typeof _sessionBridgeState;
  return {
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    signIn: (...args: unknown[]) => bridge.signIn(...args),
    signOut: (...args: unknown[]) => bridge.signOut(...args),
    useSession: () => ({
      data: bridge.session,
      status: bridge.status,
      update: jest.fn(),
    }),
  };
});

// Mock SherpaService
jest.mock('@keyhole/services/SherpaService', () => ({
  getMyClients: jest.fn(),
  getMyEntries: jest.fn(),
}));

// Mock AuthService – the path must match the import in the source code
jest.mock('@keyhole/services/AuthService', () => {
  const bridge = (globalThis as Record<string, unknown>).__sessionBridge as typeof _sessionBridgeState;
  return {
    getServerSession: (...args: unknown[]) => bridge.getServerSession(...args),
    getServerAuthHandler: jest.fn(),
  };
});
