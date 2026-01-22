import type { Meta, StoryObj } from "@storybook/react"
import { Reveal } from "./reveal"

const meta = {
    title: "Motion/Reveal",
    component: Reveal,
    tags: ["autodocs"],
} satisfies Meta<typeof Reveal>

export default meta

type Story = StoryObj<typeof meta>

export const FadeUp: Story = {
    args: {
        children: "Reveal item",
        variant: "fadeUp",
        stagger: 60,
        index: 0,
    },
    render: () => (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <Reveal key={index} variant="fadeUp" index={index} stagger={60}>
                    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                        Reveal item {index + 1}
                    </div>
                </Reveal>
            ))}
        </div>
    ),
}

export const ReducedMotion: Story = {
    args: {
        children: "Reduced motion item",
        variant: "fadeUp",
        stagger: 60,
        index: 0,
    },
    render: () => (
        <div className="reduce-motion space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <Reveal key={index} variant="fadeUp" index={index} stagger={60}>
                    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                        Reduced motion item {index + 1}
                    </div>
                </Reveal>
            ))}
        </div>
    ),
}
