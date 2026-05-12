---
name: Agapay Design System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 280px
  container_max_width: 1440px
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 32px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
---

## Brand & Style

The design system is engineered for the high-stakes environment of microfinance, where clarity, stability, and trust are paramount. The brand personality is **Institutional yet Accessible**—it feels like a modern bank but operates with the speed and transparency of a top-tier SaaS product.

The visual style follows a **Modern Corporate** aesthetic. It prioritizes information density without sacrificing legibility. High-hierarchy layouts ensure that critical financial metrics (disbursements, risk ratios, and collection rates) are immediately scannable. The interface utilizes a "Deep Mode" architecture for data-heavy dashboards, using dark slate and charcoal surfaces to reduce eye strain and make vibrant status indicators pop. 

Design pillars include:
- **Precision:** Subtle 1px borders and strict grid alignment reflect the accuracy required for financial data.
- **Optimism:** Purposeful use of emerald green to highlight growth and successful repayments.
- **Transparency:** Clear, line-art iconography and open whitespace to demystify complex workflows.

## Colors

The palette is anchored in **Deep Slate (#0F172A)**, providing a sophisticated, low-fatigue backdrop for the Tanaw (Overview) and Pintig (Pulse/Monitoring) dashboards. 

- **Primary (Agapay Blue - #2563EB):** Used for primary actions, navigation states, and brand-critical touchpoints. It represents stability and professional reliability.
- **Success (Emerald - #10B981):** Reserved for growth indicators, completed payments, and "healthy" loan statuses.
- **Risk (Amber - #F59E0B):** Used specifically for warnings, late payment alerts, and high-risk flags in the portfolio.
- **Neutrals:** A range of slates and grays are used to build depth. Surfaces sit at `#1E293B`, while borders and dividers use a subtle `#334155` to maintain structure without creating visual noise.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. 

- **Outfit** is the display typeface, bringing a clean, geometric, and modern feel to headings and large data callouts. Its open counters ensure that even at bold weights, it feels approachable.
- **Inter** is the workhorse for all UI elements, body text, and data tables. It was chosen for its exceptional legibility at small sizes and its tabular numeric properties, which are essential for aligning financial figures in the microfinance context.

**Formatting Note:** All monetary values and percentages should utilize tabular figures (`tnum`) to ensure columns of numbers remain perfectly aligned for easy comparison.

## Layout & Spacing

The layout is **Sidebar-driven**, prioritizing navigation efficiency. The primary sidebar remains fixed to the left, providing immediate access to the core modules: Loans, Collections, Clients, and Reports.

- **Grid System:** A 12-column fluid grid is used for the main content area. Data cards typically span 3, 4, or 6 columns depending on the complexity of the visualization.
- **Rhythm:** An 8px base unit drives all spacing decisions. This creates a predictable vertical rhythm, essential for complex forms and multi-row data tables.
- **Breakpoints:**
  - **Desktop (1280px+):** Full sidebar expanded, 32px outer margins.
  - **Tablet (768px - 1279px):** Sidebar collapses to icons only, 24px outer margins.
  - **Mobile (<768px):** Sidebar moves to a bottom navigation bar or a hamburger overlay, 16px outer margins, cards stack vertically.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** supplemented by low-opacity ambient shadows. In the dark dashboard environment, depth is signaled by lighter surface colors rather than heavy shadows.

- **Level 0 (Canvas):** `#0F172A` — The base background.
- **Level 1 (Cards/Sidebar):** `#1E293B` — Used for the primary content containers. These feature a 1px border of `#334155`.
- **Level 2 (Modals/Popovers):** `#334155` — Elevated surfaces that sit "above" the dashboard, featuring a soft, 15% opacity black shadow with a 20px blur to provide separation.
- **Interaction:** On hover, cards may lift slightly using a subtle primary-tinted shadow to indicate interactivity.

## Shapes

The shape language is **Soft and Professional**. A standard radius of `4px` (0.25rem) is applied to most UI components to maintain a disciplined, institutional feel while avoiding the harshness of sharp corners.

- **Small Components:** Buttons, input fields, and checkboxes use the base `4px` radius.
- **Containers:** Dashboard cards and sidebars use a `rounded-lg` (8px) radius to softly frame groups of data.
- **Status Badges:** Use a fully rounded/pill shape to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons are solid Agapay Blue with white text. Secondary buttons use a ghost style with the primary-color border. Tertiary buttons are text-only for low-priority actions.
- **Cards:** The standard "Data Summary" card includes a headline, a large Outfit-font metric, and a "Pintig" sparkline or status badge at the bottom.
- **Status Badges:** Essential for loan states. Use `emerald` for "Active/Paid," `amber` for "Grace Period," and `rose` for "Default." Badges use a 10% opacity background of their respective color with a high-contrast text label.
- **Input Fields:** Dark backgrounds (`#0F172A`) with a subtle `#334155` border. On focus, the border transitions to Agapay Blue with a 2px outer glow.
- **Line-Art Icons:** Use Lucide-style icons with a 1.5px stroke width. Icons should be monochrome (Slate-400) unless they represent a specific status (e.g., a green "Check" for success).
- **Navigation:** The sidebar uses high-contrast white icons/text for the active state and muted slate for inactive states, accompanied by a 3px vertical "indicator bar" on the left edge of the active item.