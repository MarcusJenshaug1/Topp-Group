import type { Meta, StoryObj } from "@storybook/react"
import { PageEnter } from "./page-enter"

const meta = {
    title: "Motion/PageEnter",
    component: PageEnter,
    tags: ["autodocs"],
} satisfies Meta<typeof PageEnter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <PageEnter>
            <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                Page enter content
            </div>
        </PageEnter>
    ),
    parameters: {
        docs: {
            description: {
                story: "On mount/route change, content fades in with a subtle 6px rise.",
            },
        },
    },
}

export const ReducedMotion: Story = {
    render: () => (
        <div className="reduce-motion">
            <PageEnter>
                <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                    Reduced motion content
                </div>
            </PageEnter>
        </div>
    ),
}
