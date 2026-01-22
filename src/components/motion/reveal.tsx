"use client"

import * as React from "react"
import type { JSX } from "react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion"

type RevealVariant = "fadeUp" | "fade" | "fadeLeft" | "fadeRight"

interface RevealProps {
    children: React.ReactNode
    className?: string
    variant?: RevealVariant
    delay?: number
    stagger?: number
    index?: number
    once?: boolean
    as?: keyof JSX.IntrinsicElements
}

const variantClassMap: Record<RevealVariant, string> = {
    fadeUp: "reveal-fade-up",
    fade: "reveal-fade",
    fadeLeft: "reveal-fade-left",
    fadeRight: "reveal-fade-right",
}

export function Reveal({
    children,
    className,
    variant = "fadeUp",
    delay = 0,
    stagger = 0,
    index = 0,
    once = true,
    as: Comp = "div",
}: RevealProps) {
    const prefersReducedMotion = usePrefersReducedMotion()
    const [isVisible, setIsVisible] = React.useState(prefersReducedMotion)
    const elementRef = React.useRef<any>(null)

    React.useEffect(() => {
        if (prefersReducedMotion) {
            setIsVisible(true)
            return
        }

        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (once) observer.unobserve(entry.target)
                }
            },
            { threshold: 0.2 }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [prefersReducedMotion, once])

    const totalDelay = delay + index * stagger

    const ComponentTag = Comp as React.ElementType

    return (
        <ComponentTag
            ref={elementRef}
            className={cn("reveal", variantClassMap[variant], isVisible && "reveal-visible", className)}
            style={{ "--reveal-delay": `${totalDelay}ms` } as React.CSSProperties}
        >
            {children}
        </ComponentTag>
    )
}
