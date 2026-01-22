import type { Meta, StoryObj } from "@storybook/react"
import { HeaderClient } from "./header-client"
import type { User } from "@supabase/supabase-js"

const meta = {
    title: "Layout/Header",
    component: HeaderClient,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof HeaderClient>

export default meta

type Story = StoryObj<typeof meta>

const mockUser = {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    email: "kari.nordmann@topp.no",
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { full_name: "Kari Nordmann" },
} as User

export const LoggedOut: Story = {
    args: {
        user: null,
        role: null,
        avatarUrl: null,
        fullName: null,
    },
    render: () => <HeaderClient user={null} role={null} avatarUrl={null} fullName={null} />,
}

export const LoggedInViewer: Story = {
    args: {
        user: mockUser,
        role: "viewer",
        avatarUrl: null,
        fullName: mockUser.user_metadata?.full_name ?? null,
    },
    render: () => <HeaderClient user={mockUser} role="viewer" avatarUrl={null} fullName={mockUser.user_metadata?.full_name ?? null} />,
}

export const LoggedInAdmin: Story = {
    args: {
        user: mockUser,
        role: "admin",
        avatarUrl: null,
        fullName: mockUser.user_metadata?.full_name ?? null,
    },
    render: () => <HeaderClient user={mockUser} role="admin" avatarUrl={null} fullName={mockUser.user_metadata?.full_name ?? null} />,
}
