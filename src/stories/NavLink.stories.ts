import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NavLink } from '../lib/components/molecules/nav-link';

const meta = {
  title: 'Components/Molecules/NavLink',
  component: NavLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '/',
    children: 'Home Page',
  },
};

export const GithubInfo: Story = {
  args: {
    href: '/github',
    children: 'Github Info',
  },
};
