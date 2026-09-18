# Cunga Brand Style Guide

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Logo Usage](#logo-usage)
5. [Components](#components)
6. [Gradients](#gradients)
7. [Spacing & Layout](#spacing--layout)
8. [Best Practices](#best-practices)

---

## Brand Identity

### Brand Name
**Cunga**

### Tagline
*"Simplify Operations, Amplify Success"*

### Brand Values
- **Simplicity**: Easy to use, intuitive interface
- **Reliability**: Secure, stable, and trustworthy
- **Innovation**: Modern technology and design
- **Empowerment**: Helping businesses grow and succeed

---

## Color Palette

### Primary Colors
Our primary color is **Indigo**, representing trust, professionalism, and technology.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| Primary 50 | `#EEF2FF` | Light backgrounds, hover states |
| Primary 100 | `#E0E7FF` | Subtle highlights |
| Primary 200 | `#C7D2FE` | Border colors |
| Primary 500 | `#6366F1` | Primary buttons, links, icons (Main brand color) |
| Primary 600 | `#4F46E5` | Hover states for primary elements |
| Primary 700 | `#4338CA` | Active states |

### Accent Colors
Our accent color is **Pink**, adding energy and vibrancy.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| Accent 50 | `#FDF2F8` | Light backgrounds |
| Accent 100 | `#FCE7F3` | Subtle highlights |
| Accent 200 | `#FBCFE8` | Border colors |
| Accent 500 | `#EC4899` | Accent buttons, badges (Secondary brand color) |
| Accent 600 | `#DB2777` | Hover states |
| Accent 700 | `#BE185D` | Active states |

### Semantic Colors

#### Success (Green)
| Shade | Hex Code | Usage |
|-------|----------|-------|
| Success 50 | `#F0FDF4` | Success message backgrounds |
| Success 500 | `#10B981` | Success indicators, positive metrics |
| Success 600 | `#059669` | Hover states |

#### Warning (Orange)
| Shade | Hex Code | Usage |
|-------|----------|-------|
| Warning 50 | `#FFFBEB` | Warning message backgrounds |
| Warning 500 | `#F59E0B` | Warning indicators, alerts |
| Warning 600 | `#D97706` | Hover states |

#### Error (Red)
| Shade | Hex Code | Usage |
|-------|----------|-------|
| Error 50 | `#FEF2F2` | Error message backgrounds |
| Error 500 | `#EF4444` | Error indicators, destructive actions |
| Error 600 | `#DC2626` | Hover states |

#### Info (Blue)
| Shade | Hex Code | Usage |
|-------|----------|-------|
| Info 50 | `#EFF6FF` | Info message backgrounds |
| Info 500 | `#3B82F6` | Information indicators |
| Info 600 | `#2563EB` | Hover states |

### Neutral Colors (Grays)

| Shade | Hex Code | Usage |
|-------|----------|-------|
| Gray 50 | `#F9FAFB` | Card backgrounds |
| Gray 100 | `#F3F4F6` | Section backgrounds |
| Gray 200 | `#E5E7EB` | Borders |
| Gray 400 | `#9CA3AF` | Disabled text |
| Gray 500 | `#6B7280` | Secondary text |
| Gray 600 | `#4B5563` | Body text |
| Gray 700 | `#374151` | Labels |
| Gray 900 | `#111827` | Headings |

---

## Typography

### Font Families

#### Display Font (Headings)
**Poppins** - Sans-serif font for headings and emphasis
- Weight: 400 (Regular), 600 (SemiBold), 700 (Bold)
- Usage: Page titles, section headings, buttons, badges
- CSS Class: `font-display`

#### Body Font
**Inter** - Sans-serif font for body text and UI
- Weight: 400 (Regular), 500 (Medium), 600 (SemiBold)
- Usage: Paragraphs, labels, inputs, tables
- CSS Class: `font-sans` (default)

### Font Sizes

| Size | Pixels | Usage | Tailwind Class |
|------|--------|-------|----------------|
| xs | 12px | Small labels, captions | `text-xs` |
| sm | 14px | Secondary text, table cells | `text-sm` |
| base | 16px | Body text, inputs | `text-base` |
| lg | 18px | Lead paragraphs | `text-lg` |
| xl | 20px | Small headings | `text-xl` |
| 2xl | 24px | Section headings | `text-2xl` |
| 3xl | 30px | Page sub-titles | `text-3xl` |
| 4xl | 36px | Page titles | `text-4xl` |
| 5xl | 48px | Hero headings | `text-5xl` |

### Font Weights

| Weight | Value | Tailwind Class |
|--------|-------|----------------|
| Normal | 400 | `font-normal` |
| Medium | 500 | `font-medium` |
| Semibold | 600 | `font-semibold` |
| Bold | 700 | `font-bold` |

---

## Logo Usage

### Logo Variants
1. **Primary Logo**: Full color logo on light backgrounds
2. **White Logo**: White version for dark or colored backgrounds
3. **Icon Only**: Standalone icon for small spaces (favicons, avatars)

### Clear Space
Maintain minimum clear space around the logo equal to the height of the "C" in Cunga.

### Minimum Size
- Full logo: Minimum width 120px
- Icon only: Minimum 32px × 32px

### Don'ts
❌ Don't change logo colors
❌ Don't rotate or distort the logo
❌ Don't place logo on busy backgrounds
❌ Don't recreate or modify the logo

---

## Components

### Buttons

#### Primary Button
```tsx
<Button className="btn-primary">Click Me</Button>
```
- Background: Gradient (Primary 500 → Primary 600)
- Text: White, font-semibold
- Hover: Enhanced shadow (shadow-cunga)
- Use for: Primary actions, CTAs

#### Outline Button
```tsx
<Button variant="outline">Click Me</Button>
```
- Border: 2px, Primary 500
- Text: Primary 600
- Hover: Light primary background
- Use for: Secondary actions

#### Ghost Button
```tsx
<Button variant="ghost">Click Me</Button>
```
- Background: Transparent
- Text: Gray 600
- Hover: Light gray background
- Use for: Tertiary actions, navigation

### Badges

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
<Badge variant="primary">Featured</Badge>
```

- Small, rounded labels
- Use semantic colors for status
- Keep text short (1-2 words)

### Cards

```tsx
<Card className="card-hover">
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>
```

- White background with shadow
- Rounded corners (rounded-xl)
- Add `card-hover` class for interactive cards
- Use gradient backgrounds for emphasis

### Alerts

```tsx
<Alert variant="success">Operation successful!</Alert>
<Alert variant="error">An error occurred</Alert>
```

- Use icons to reinforce message type
- Keep messages concise and actionable
- Dismissible when appropriate

### Input Fields

```tsx
<Input
  placeholder="Enter text..."
  leftIcon={<Icon />}
/>
```

- Border: 1px, Gray 300
- Focus: 2px ring, Primary 500
- Rounded corners (rounded-lg)
- Include icons for context

---

## Gradients

### Brand Gradients

#### Primary Gradient
```css
background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
```
**CSS Class:** `bg-gradient-primary`
**Usage:** Primary buttons, hero sections, important cards

#### Accent Gradient
```css
background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
```
**CSS Class:** `bg-gradient-accent`
**Usage:** Secondary CTAs, highlights, badges

#### Success Gradient
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
```
**CSS Class:** `bg-gradient-success`
**Usage:** Success messages, positive metrics

#### Warning Gradient
```css
background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
```
**CSS Class:** `bg-gradient-warning`
**Usage:** Warning messages, alerts

### Text Gradients

```tsx
<h1 className="bg-gradient-primary bg-clip-text text-transparent">
  Gradient Text
</h1>
```

Use for hero headings and emphasis.

---

## Spacing & Layout

### Spacing Scale

| Size | Pixels | Tailwind Class |
|------|--------|----------------|
| 1 | 4px | `space-1`, `gap-1`, `p-1`, `m-1` |
| 2 | 8px | `space-2`, `gap-2`, `p-2`, `m-2` |
| 3 | 12px | `space-3`, `gap-3`, `p-3`, `m-3` |
| 4 | 16px | `space-4`, `gap-4`, `p-4`, `m-4` |
| 6 | 24px | `space-6`, `gap-6`, `p-6`, `m-6` |
| 8 | 32px | `space-8`, `gap-8`, `p-8`, `m-8` |

### Layout Grid

- Use responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Standard gap: `gap-4` (16px) or `gap-6` (24px)
- Card padding: `p-6` (24px)
- Section spacing: `space-y-8` (32px between sections)

### Border Radius

| Size | Pixels | Tailwind Class |
|------|--------|----------------|
| Small | 4px | `rounded` |
| Medium | 8px | `rounded-lg` |
| Large | 12px | `rounded-xl` |
| Circle | 50% | `rounded-full` |

---

## Best Practices

### ✅ Do's

1. **Use gradient backgrounds for primary CTAs and hero sections**
   - Apply `bg-gradient-primary` class for consistent branding

2. **Use font-display for headings, font-sans for body text**
   - Maintains typographic hierarchy and readability

3. **Add card-hover class to interactive cards**
   - Provides consistent hover feedback across the platform

4. **Use semantic color variants for status indicators**
   - success (green), warning (orange), error (red), info (blue)

5. **Maintain minimum contrast ratios for accessibility**
   - WCAG AA requires 4.5:1 for normal text, 3:1 for large text

6. **Use icons with text for better comprehension**
   - From lucide-react library

7. **Add loading states for async operations**
   - Use `<Spinner />` component

8. **Group related information with cards**
   - Use white cards with shadow for content sections

### ❌ Don'ts

1. **Don't use more than 2-3 colors in a single component**
   - Stick to primary, accent, and semantic colors

2. **Don't mix gradient styles**
   - Use consistent gradient direction (135deg)

3. **Don't use tiny font sizes (below 12px)**
   - Maintain readability standards

4. **Don't place important content on gradient backgrounds**
   - Gradients should enhance, not obscure

5. **Don't override component styles unnecessarily**
   - Use provided variants and props

6. **Don't forget hover and focus states**
   - All interactive elements need visual feedback

7. **Don't use more than 3 font weights**
   - Stick to regular, semibold, and bold

---

## Animations

### Transitions
```css
.transition-all { transition: all 0.2s ease; }
```

### Hover Effects
```css
.card-hover {
  @apply transition-all duration-200;
  @apply hover:shadow-xl hover:-translate-y-1;
}
```

### Loading Animations
```css
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

### Fade In
```css
.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Shadows

### Custom Shadows
```css
/* Brand shadow for primary elements */
.shadow-cunga {
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);
}

/* Accent shadow */
.shadow-accent {
  box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.3);
}
```

### Standard Shadows
- `shadow-sm`: Subtle elevation
- `shadow-md`: Default cards
- `shadow-lg`: Important cards
- `shadow-xl`: Hover states, modals

---

## Accessibility

### Color Contrast
- Ensure text meets WCAG AA standards (4.5:1 for normal text)
- Use darker shades for text on light backgrounds
- Provide alternative text for images and icons

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Maintain logical tab order

### Screen Readers
- Use semantic HTML elements
- Provide aria-labels for icon-only buttons
- Include alt text for informational images

---

## Implementation

### Import Brand Constants
```tsx
import { BRAND_COLORS, BRAND_GRADIENTS, BRAND_INFO } from '@constants/brand'
```

### Use Tailwind Classes
```tsx
// Primary button with gradient
<button className="btn-primary shadow-cunga">
  Click Me
</button>

// Card with hover effect
<div className="card-hover bg-white">
  Content
</div>

// Gradient text
<h1 className="font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
  Heading
</h1>
```

---

## Resources

- **Live Style Guide**: `/admin/style-guide` (in application)
- **Color Palette**: Defined in `frontend/src/constants/brand.ts`
- **Components**: Located in `frontend/src/components/common/`
- **Tailwind Config**: `frontend/tailwind.config.js`

---

## Version History

- **v1.0** - Initial brand style guide (January 2024)
- Cunga Platform Design System

---

*For questions or updates to this style guide, contact the design team.*
