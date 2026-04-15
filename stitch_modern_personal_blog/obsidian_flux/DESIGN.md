# Design System Document: High-End Technical Editorial

## 1. Overview & Creative North Star
### Creative North Star: "The Digital Curator"
This design system moves away from the generic "dashboard" aesthetic, embracing a high-fidelity editorial approach tailored for complex technical discourse. It is designed to feel like a premium, dark-mode journal—authoritative yet breathable. 

The system rejects the "boxed-in" feeling of traditional web grids. Instead, it utilizes **Intentional Asymmetry** and **Tonal Depth**. By leveraging a deep charcoal canvas with vibrant, functional accents, we create a focus-oriented environment where the content is the protagonist, and the UI acts as a sophisticated, quiet scaffolding.

---

## 2. Colors: Tonal Architecture
The palette is rooted in a "Deep Onyx" foundation, using light not just for visibility, but to define physical presence.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a code block should sit on `surface-container-low` against a `surface` background, creating a natural edge through contrast rather than a stroke.

### Surface Hierarchy & Nesting
We treat the UI as a series of layered, physical sheets.
- **Base Layer:** `surface` (#0e0e0e) — The infinite canvas.
- **Sectioning:** `surface-container-low` (#131313) — For large content areas.
- **Component Base:** `surface-container` (#1a1919) — For cards and primary modules.
- **Interaction/Elevation:** `surface-container-high` (#201f1f) — For hovered states or elevated overlays.

### The "Glass & Gradient" Rule
To inject "soul" into the technical aesthetic:
- **Glassmorphism:** Use `surface-variant` with a 60% opacity and a `backdrop-blur` of 12px-20px for top navigation and floating sidebars.
- **Signature Textures:** Main CTAs and active states should utilize a subtle linear gradient from `primary` (#8cacff) to `primary-container` (#769dff) at a 135-degree angle. This provides a tactile, high-fidelity sheen that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
The typographic system pairs the technical precision of **Manrope** for structure with the rhythmic readability of **Inter** for narrative.

*   **Display & Headlines (Manrope):** High-contrast sizing. `display-lg` (3.5rem) is used for hero titles to establish an immediate editorial presence. Headlines use a tighter letter-spacing (-0.02em) to feel "locked-in" and intentional.
*   **Body (Inter):** Optimized for long-form technical reading. `body-md` (0.875rem) is the workhorse, utilizing a generous line-height (1.6) to ensure clarity against the dark background.
*   **Labels (Space Grotesk):** Used for technical metadata and micro-copy. The monospace-adjacent feel of Space Grotesk reinforces the "Modern Tech" identity.

---

## 4. Elevation & Depth
In this system, depth is a product of light and layering, never "structural" lines.

*   **The Layering Principle:** Stack `surface-container` tiers. A `surface-container-highest` card placed on a `surface-container-low` wrapper creates a soft, sophisticated lift.
*   **Ambient Shadows:** For floating elements (tooltips, dropdowns), use "True Ambient" shadows. Color: `primary` at 4% opacity. Blur: 40px. Spread: -10px. This mimics a soft glow from a screen rather than a muddy grey drop shadow.
*   **The "Ghost Border" Fallback:** If a border is required for extreme accessibility needs, use `outline-variant` at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Navigation Sidebar
*   **Style:** Minimalist text list with `label-md`.
*   **Signifiers:** Use the "Vibrant Dots" pattern. Specific categories are marked with a 6px circular dot using `primary`, `secondary`, or `tertiary` tokens.
*   **Active State:** Use a `surface-container-high` pill background with `md` (0.375rem) roundedness. No borders.

### Primary Buttons
*   **Background:** Gradient from `primary` to `primary-dim`.
*   **Typography:** `label-md` (Space Grotesk), Uppercase, Bold.
*   **Interaction:** On hover, increase `backdrop-filter: brightness(1.1)`.

### Technical Cards
*   **Structure:** No dividers. Separate the header, body, and footer using the **Spacing Scale** (e.g., 24px padding between sections).
*   **Background:** `surface-container` (#1a1919).
*   **Corner Radius:** `lg` (0.5rem) for a modern, slightly softened technical feel.

### Input Fields
*   **State:** Default state uses `surface-container-lowest` background with a `Ghost Border`.
*   **Focus State:** The border transitions to 40% opacity `primary`, and the background shifts to `surface-container-low`.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use generous whitespace (80px - 120px) between major content sections to allow the technical density of the text to breathe.
*   **Do** use "Tonal Transitions" for hover states. Instead of changing color, shift from `surface-container` to `surface-container-high`.
*   **Do** apply `text-wrap: balance` to all headlines to ensure an editorial, hand-crafted look.

### Don't:
*   **Don't** use 1px solid lines to separate list items. Use 12px or 16px of vertical padding instead.
*   **Don't** use pure white (#FFFFFF) for body text. Use `on_surface_variant` (#adaaaa) to reduce eye strain in dark mode, saving pure `on_surface` for headlines.
*   **Don't** use standard "Material" shadows. If an element doesn't feel elevated enough through color alone, re-evaluate your nesting hierarchy before adding a shadow.