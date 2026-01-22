import type { Meta, StoryObj } from "@storybook/react"
import { Building2 } from "lucide-react"

import { BusinessAreaCard } from "./business-area-card"

const meta = {
    title: "Domain/BusinessAreaCard",
    component: BusinessAreaCard,
    tags: ["autodocs"],
} satisfies Meta<typeof BusinessAreaCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: "Eiendom",
        description: "Utvikling av bolig, næring og fritidseiendom med høy arkitektonisk kvalitet.",
        href: "/eiendom",
        icon: Building2,
        tags: ["Bolig", "Næring", "Hotell"],
    },
    parameters: {
        docs: {
            description: {
                story: "Hover: card lifts slightly, shadow deepens, and accent elements brighten subtly.",
            },
        },
    },
}

export const ReducedMotion: Story = {
    render: (args) => (
        <div className="reduce-motion max-w-xl">
            <BusinessAreaCard {...args} />
        </div>
    ),
    args: {
        title: "Investeringer",
        description: "Strategiske posisjoner i vekstselskaper og markeder med solid potensial.",
        href: "/investeringer",
        icon: Building2,
        tags: ["Kapital", "Kompetanse", "Nettverk"],
    },
}
