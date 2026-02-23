/**
 * Session Bridge - Integration testing utilities for NextAuth sessions.
 *
 * Provides helpers for both component tests (client-side SessionProvider)
 * and server-side tests (mocking getServerSession).
 *
 * All jest.mock() calls live in test/setup.tsx (which Jest properly hoists).
 * This file only exports helper functions that configure the shared mock state.
 */
import { render, type RenderOptions } from '@testing-library/react';
import type { Session } from 'next-auth';
import type { ReactElement } from 'react';

// ---------------------------------------------------------------------------
// Shared mock state (set up in test/setup.tsx via globalThis.__sessionBridge)
// ---------------------------------------------------------------------------

interface SessionBridgeState {
  session: Session | null;
  status: string;
  signIn: jest.Mock;
  signOut: jest.Mock;
  getServerSession: jest.Mock;
}

function getBridge(): SessionBridgeState {
  return (globalThis as Record<string, unknown>).__sessionBridge as SessionBridgeState;
}

// ---------------------------------------------------------------------------
// 1. Session factories
// ---------------------------------------------------------------------------

/** Minimal authenticated GitHub session used as the default base. */
const DEFAULT_SESSION: Session = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://avatars.githubusercontent.com/u/1234567',
    githubLogin: 'testuser',
  },
  auth: {
    provider: 'github',
    accountId: '1234567',
    token: 'gho_mock_token_for_testing',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Build a mock Session by merging overrides onto sensible defaults.
 *
 * @example
 * ```ts
 * const session = createMockSession(); // full default session
 * const guest = createMockSession({ user: { name: 'Guest', email: 'guest@test.com' } });
 * const noGithub = createMockSession({ user: { githubLogin: undefined } });
 * ```
 */
export function createMockSession(overrides?: {
  user?: Partial<Session['user']>;
  auth?: Partial<Session['auth']>;
  expires?: string;
}): Session {
  return {
    ...DEFAULT_SESSION,
    ...(overrides?.expires ? { expires: overrides.expires } : {}),
    user: {
      ...DEFAULT_SESSION.user,
      ...overrides?.user,
    },
    auth: {
      ...DEFAULT_SESSION.auth,
      ...overrides?.auth,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Component-level session bridge (client-side)
// ---------------------------------------------------------------------------

/** Re-export the mock fns so tests can assert on signIn / signOut calls. */
export const mockSignIn = getBridge().signIn;
export const mockSignOut = getBridge().signOut;

interface RenderWithSessionOptions extends Omit<RenderOptions, 'wrapper'> {
  /** The session to provide. `null` → unauthenticated, omit → default authenticated. */
  session?: Session | null;
  /** Override the status string (auto-derived from session by default). */
  status?: 'authenticated' | 'unauthenticated' | 'loading';
}

/**
 * Render a component wrapped with a mocked NextAuth SessionProvider.
 *
 * @example
 * ```tsx
 * // Authenticated with default session
 * renderWithSession(<Header session={createMockSession()} />);
 *
 * // Unauthenticated
 * renderWithSession(<Header session={null} />, { session: null });
 *
 * // Loading state
 * renderWithSession(<Header session={null} />, { status: 'loading' });
 * ```
 */
export function renderWithSession(
  ui: ReactElement,
  { session, status, ...renderOptions }: RenderWithSessionOptions = {},
) {
  const bridge = getBridge();

  // Configure the shared session state _before_ rendering.
  const resolvedSession = session === undefined ? createMockSession() : session;
  const resolvedStatus =
    status ?? (resolvedSession ? 'authenticated' : 'unauthenticated');

  bridge.session = resolvedSession;
  bridge.status = resolvedStatus;

  // Reset sign-in/out mocks between renders so assertions stay clean.
  bridge.signIn.mockClear();
  bridge.signOut.mockClear();

  return render(ui, renderOptions);
}

// ---------------------------------------------------------------------------
// 3. Server-side session bridge (controllers / API routes)
// ---------------------------------------------------------------------------

/** Direct access to the mocked getServerSession for advanced assertions. */
export const mockGetServerSession = getBridge().getServerSession;

/**
 * Configure `getServerSession` to resolve with a given session for
 * server-side integration tests.
 *
 * @example
 * ```ts
 * // Authenticated
 * mockServerSession(createMockSession({ user: { name: 'Alice' } }));
 * const props = await getPrivatePageProps();
 *
 * // Unauthenticated
 * mockServerSession(null);
 * await expect(getPrivatePageProps()).rejects.toThrow('REDIRECT:/');
 * ```
 */
export function mockServerSession(session: Session | null): void {
  getBridge().getServerSession.mockResolvedValue(session);
}

/**
 * Configure `getServerSession` to reject – useful for testing error paths.
 */
export function mockServerSessionError(error: Error | string): void {
  getBridge().getServerSession.mockRejectedValue(
    typeof error === 'string' ? new Error(error) : error,
  );
}
