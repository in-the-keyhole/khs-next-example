import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageTemplate } from '../lib/components/templates/page-template';

const meta = {
  title: 'Components/Templates/PageTemplate',
  component: PageTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithContent: Story = {
  render: () => (
    <PageTemplate>
      <h2 className="p-2 text-2xl font-bold text-center">Page Content</h2>
      <p className="text-center mt-4">Content rendered inside the page template.</p>
    </PageTemplate>
  ),
};

export const WithMultipleSections: Story = {
  render: () => (
    <PageTemplate>
      <h2 className="p-2 text-2xl font-bold text-center">First Section</h2>
      <p className="text-center mt-4">First section content.</p>
      <h2 className="p-2 text-2xl font-bold text-center mt-8">Second Section</h2>
      <p className="text-center mt-4">Second section content.</p>
    </PageTemplate>
  ),
};
