import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../organisms/header';
import {
  createMockSession,
  renderWithSession,
  mockSignIn,
  mockSignOut,
} from '../../../../test/session-bridge';

describe('Header', () => {
  describe('when loading', () => {
    it('should show loading message', () => {
      renderWithSession(<Header session={null} />, { status: 'loading' });

      expect(screen.getByText('Loading Session...')).toBeInTheDocument();
    });

    it('should not show login or logout buttons when loading', () => {
      renderWithSession(<Header session={null} />, { status: 'loading' });

      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('when unauthenticated', () => {
    it('should show guest indicator', () => {
      renderWithSession(<Header session={null} />, { session: null });

      expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('should show login button', () => {
      renderWithSession(<Header session={null} />, { session: null });

      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should show home page link', () => {
      renderWithSession(<Header session={null} />, { session: null });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should not show logout button', () => {
      renderWithSession(<Header session={null} />, { session: null });

      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should not show Github Info link', () => {
      renderWithSession(<Header session={null} />, { session: null });

      expect(screen.queryByText('Github Info')).not.toBeInTheDocument();
    });

    it('should call signIn when login button is clicked', async () => {
      renderWithSession(<Header session={null} />, { session: null });

      await userEvent.click(screen.getByText('Login'));

      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('when authenticated', () => {
    const session = createMockSession();

    it('should show user name', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show profile image', () => {
      renderWithSession(<Header session={session} />, { session });

      const image = screen.getByAltText('Profile Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', session.user.image);
    });

    it('should show logout button', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should show home page link', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should show Github Info link when user has githubLogin', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Github Info')).toBeInTheDocument();
    });

    it('should not show Timesheet link for GitHub users', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByText('Timesheet')).not.toBeInTheDocument();
    });

    it('should call signOut when logout button is clicked', async () => {
      renderWithSession(<Header session={session} />, { session });

      await userEvent.click(screen.getByText('Logout'));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should not show login button', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('should not show guest indicator', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByText('Guest')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated without githubLogin', () => {
    const session = createMockSession({ user: { githubLogin: undefined } });

    it('should not show Github Info link', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByText('Github Info')).not.toBeInTheDocument();
    });

    it('should still show other authenticated elements', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  describe('when authenticated as Keyhole user (no image, no githubLogin)', () => {
    const session = createMockSession({
      user: { image: undefined, githubLogin: undefined },
      auth: { provider: 'keyhole', accountId: 'jdoe', token: 'sherpa_token', roles: ['admin'] },
    });

    it('should not show Github Info link', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByText('Github Info')).not.toBeInTheDocument();
    });

    it('should show fallback avatar instead of profile image', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByAltText('Profile Image')).not.toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should show user name and authenticated controls', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should show Timesheet link for Keyhole users', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Timesheet')).toBeInTheDocument();
    });
  });

  describe('when authenticated without profile image', () => {
    const session = createMockSession({ user: { image: undefined } });

    it('should show fallback avatar instead of profile image', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.queryByAltText('Profile Image')).not.toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should still show authenticated controls', () => {
      renderWithSession(<Header session={session} />, { session });

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});
