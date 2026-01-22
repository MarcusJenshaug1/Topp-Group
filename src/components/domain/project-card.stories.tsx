import type { Meta, StoryObj } from "@storybook/react"

import { ProjectCard } from "./project-card"

const meta = {
    title: "Domain/ProjectCard",
    component: ProjectCard,
    tags: ["autodocs"],
} satisfies Meta<typeof ProjectCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: "Fjordbyen",
        category: "Næring",
        excerpt: "Et moderne næringsprosjekt med fokus på bærekraftige løsninger og arkitektur.",
        year: 2024,
        slug: "fjordbyen",
        imageUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop",
    },
    parameters: {
        docs: {
            description: {
                story: "Hover: card lifts 2px, shadow increases, image zooms slightly, and title/arrow shift to hover dark.",
            },
        },
    },
}

export const ReducedMotion: Story = {
    render: (args) => (
        <div className="reduce-motion max-w-sm">
            <ProjectCard {...args} />
        </div>
    ),
    args: {
        title: "Kysthagen",
        category: "Bolig",
        excerpt: "Kompakte boliger med utsikt og tilgang til grønne fellesarealer.",
        year: 2023,
        slug: "kysthagen",
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
    },
}
