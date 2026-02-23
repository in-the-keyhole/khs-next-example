import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HomePage } from '../lib/components/pages/home';

const meta = {
  title: 'Components/Pages/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  args: {},
};

export const LoggedIn: Story = {
  args: {
    name: 'Jane Doe',
  },
};
