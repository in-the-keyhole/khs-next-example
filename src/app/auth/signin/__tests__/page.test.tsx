import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { renderWithSession, mockSignIn } from '../../../../../test/session-bridge';
import SignInPage from '../page';

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  it('should render the sign-in heading', () => {
    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render the Keyhole credentials form', () => {
    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Keyhole')).toBeInTheDocument();
  });

  it('should render the GitHub sign-in button', () => {
    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('should call signIn with keyhole provider on form submit', async () => {
    renderWithSession(<SignInPage />, { session: null });

    await userEvent.type(screen.getByLabelText('Username'), 'jdoe');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByText('Sign in with Keyhole'));

    expect(mockSignIn).toHaveBeenCalledWith('keyhole', {
      userid: 'jdoe',
      password: 'secret123',
      callbackUrl: '/',
    });
  });

  it('should call signIn with github provider when GitHub button is clicked', async () => {
    renderWithSession(<SignInPage />, { session: null });

    await userEvent.click(screen.getByText('Sign in with GitHub'));

    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/' });
  });

  it('should use callbackUrl from search params', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => (key === 'callbackUrl' ? '/dashboard' : null)),
    });

    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByText('Sign in with Keyhole')).toBeInTheDocument();
  });

  it('should show error message for CredentialsSignin error', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'error') return 'CredentialsSignin';
        return null;
      }),
    });

    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
  });

  it('should show generic error message for other errors', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'error') return 'OAuthSignin';
        return null;
      }),
    });

    renderWithSession(<SignInPage />, { session: null });

    expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
  });

  it('should not show error message when there is no error', () => {
    renderWithSession(<SignInPage />, { session: null });

    expect(screen.queryByText('Invalid username or password.')).not.toBeInTheDocument();
    expect(screen.queryByText('An error occurred. Please try again.')).not.toBeInTheDocument();
  });

  it('should disable submit button while signing in', async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})); // never resolves

    renderWithSession(<SignInPage />, { session: null });

    await userEvent.type(screen.getByLabelText('Username'), 'jdoe');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByText('Sign in with Keyhole'));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
});
