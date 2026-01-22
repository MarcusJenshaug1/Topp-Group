import type { Meta, StoryObj } from '@storybook/react';
import { ProfileMenu } from './profile-menu';
import { User } from '@supabase/supabase-js';

const meta: Meta<typeof ProfileMenu> = {
  title: 'Auth/ProfileMenu',
  component: ProfileMenu,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'light',
      },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileMenu>;

// Mock User object
const createMockUser = (email: string, fullName?: string): User => ({
  id: 'test-user-id',
  app_metadata: { provider: 'email' },
  user_metadata: fullName ? { full_name: fullName } : {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: email,
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
});

export const Viewer: Story = {
  args: {
    user: createMockUser('viewer@example.com', 'Kari Nordmann'),
    role: 'viewer',
  },
  play: async ({ canvasElement }) => {
     // Interaction tests could go here
  }
};

export const Admin: Story = {
  args: {
    user: createMockUser('admin@example.com', 'Ola Hansen'),
    role: 'admin',
  },
};

export const Editor: Story = {
  args: {
    user: createMockUser('editor@example.com', 'Sara Berg'),
    role: 'editor',
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <div className="reduce-motion">
      <ProfileMenu {...args} />
    </div>
  ),
  args: {
    user: createMockUser('viewer@example.com', 'Kari Nordmann'),
    role: 'viewer',
  },
};
