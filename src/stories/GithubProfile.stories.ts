import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GithubProfile } from '../lib/components/organisms/github-profile';

const meta = {
  title: 'Components/Organisms/GithubProfile',
  component: GithubProfile,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GithubProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullProfile: Story = {
  args: {
    name: 'Jane Doe',
    login: 'janedoe',
    location: 'Kansas City, MO',
    html_url: 'https://github.com/janedoe',
  },
};

export const NoLocation: Story = {
  args: {
    name: 'Jane Doe',
    login: 'janedoe',
    html_url: 'https://github.com/janedoe',
  },
};

export const MinimalProfile: Story = {
  args: {
    name: 'Jane Doe',
    login: 'janedoe',
  },
};
