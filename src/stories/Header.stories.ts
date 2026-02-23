import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Header } from '../lib/components/organisms/header';

const meta = {
  title: 'Components/Organisms/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    session: null,
  },
};

export const LoggedIn: Story = {
  args: {
    session: {
      user: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        image: 'https://avatars.githubusercontent.com/u/583231?v=4',
      },
      auth: {
        provider: 'github',
        accountId: '583231',
        token: 'mock-token',
      },
      expires: '2099-01-01T00:00:00.000Z',
    },
  },
};

export const LoggedInWithGithub: Story = {
  args: {
    session: {
      user: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        image: 'https://avatars.githubusercontent.com/u/583231?v=4',
        githubLogin: 'janedoe',
      },
      auth: {
        provider: 'github',
        accountId: '583231',
        token: 'mock-token',
      },
      expires: '2099-01-01T00:00:00.000Z',
    },
  },
};
