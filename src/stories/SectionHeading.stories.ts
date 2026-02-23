import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SectionHeading } from '../lib/components/atoms/section-heading';

const meta = {
  title: 'Components/Atoms/SectionHeading',
  component: SectionHeading,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Section Title',
  },
};
