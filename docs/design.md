# Design System Documentation

## Overview
This document outlines the design system implemented for the Topp Group website. The design philosophy is "Premium Scandinavian," focusing on minimalism, high contrast, depth, and clean topography.

## Design Tokens

### Colors
Defined in `src/styles/tokens.css` and mapped in `tailwind.config.ts` (via `globals.css` theme).

| Token Name | Hex/Value | Usage |
|:---|:---|:---|
| `--color-background` | `#FAFAFB` | Main page background (Near White) |
| `--color-surface` | `#FFFFFF` | Card and container backgrounds (Pure White) |
| `--color-surface-muted` | `#F3F5F7` | Section backgrounds, headers |
| `--color-surface-dark` | `#1D2430` | Dark sections (e.g., Footer, Stats) |
| `--color-primary` | `#1F2937` | Primary text, actions (Dark Slate) |
| `--color-accent` | `#2B5CFF` | Interactive elements, highlights (Digital Blue) |
| `--color-hover-dark` | `#2E3745` | Hover state for primary buttons |

### Typography
We use **Outfit** (Google Font) for a modern, geometric look.

- **Headings**: Bold, tight tracking (`tracking-tight`).
- **Body**: Clean, high legibility.
- **Labels**: Uppercase, tracking wide (`tracking-wide`).

### Radius
- Cards: `xl` (16px) or `2xl` (24px)
- Buttons: `lg` (8px) or `full` (pill shape)
- Inputs: `lg` (8px)

## Components

### Base Components
Refactored directly in `src/components/ui`.

- **Button**:
    - `default`: Dark slate, soft shadow, darkens on hover.
    - `outline`: Bordered, clean, hovers to surface-muted.
    - `ghost`: Transparent, hovers to surface-muted.
- **Card**:
    - `bg-surface`, `border-border/40`.
    - Subtle shadow that lifts on hover (`hover:shadow-lg`).
- **Badge**:
    - Soft pill aesthetic.
    - `secondary`: Light background, dark text (e.g., tags).
    - `outline`: Transparent with subtle border.

### Domain Components

- **ProjectCard** (`src/components/domain/project-card.tsx`):
    - Image-driven card with hover zoom effect.
    - "Lift" animation on hover.
    - Status badges overlay on image.
- **BusinessAreaCard** (`src/components/domain/business-area-card.tsx`):
    - Large feature card for homepage.
    - Supports abstract patterns (`building`, `chart`).
    - Gradient overlays for text readability.

## Layout

- **Header**:
    - `sticky`, `backdrop-blur`.
    - Navigation links with animated underline effect.
- **Footer**:
    - `bg-surface-muted` for visual separation.
    - Clean columnar layout.

## Micro-interactions
- Buttons have a scale/brightness transition.
- Links have underline animations.
- Cards calculate shadow and translation on hover.
- Images zoom slowly to create depth.
