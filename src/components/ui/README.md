# UI Components Library

Mobile-first UI components for the Community Library System built with React, TypeScript, and Tailwind CSS.

## Components

### Button

A versatile button component with multiple variants and sizes.

**Props:**
- `variant`: `'primary'` | `'secondary'` (default: `'primary'`)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `fullWidth`: boolean (default: `false`)
- All standard HTML button attributes

**Features:**
- Minimum touch target of 44px (mobile-friendly)
- Focus ring for accessibility
- Disabled state styling
- Smooth color transitions

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="secondary" fullWidth>
  Full Width Button
</Button>
```

### Input

A form input component with label, error, and helper text support.

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- `fullWidth`: boolean (default: `true`)
- `type`: HTML input type (default: `'text'`)
- All standard HTML input attributes

**Features:**
- Minimum touch target of 44px
- Error state with red border
- Helper text for guidance
- Focus ring for accessibility
- Supports all input types (text, email, password, etc.)

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={error}
  helperText="We'll never share your email"
/>
```

### Card

A flexible card component for displaying content with optional hover effects.

**Sub-components:**
- `Card`: Main container
- `CardImage`: Image section
- `CardBody`: Content area with padding
- `CardTitle`: Heading (line-clamped to 2 lines)
- `CardDescription`: Description text (line-clamped to 3 lines)
- `CardFooter`: Footer with action buttons

**Props:**
- `hoverable`: boolean (default: `false`) - Adds hover shadow effect
- All standard HTML div attributes

**Features:**
- Responsive image handling
- Text truncation with line-clamp
- Flexible footer for actions
- Shadow and border styling

**Usage:**
```tsx
import {
  Card,
  CardImage,
  CardBody,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui';

<Card hoverable>
  <CardImage src="/book.jpg" alt="Book Title" />
  <CardBody>
    <CardTitle>Book Title</CardTitle>
    <CardDescription>Book description goes here</CardDescription>
  </CardBody>
  <CardFooter>
    <Button variant="primary" size="sm">
      Borrow
    </Button>
  </CardFooter>
</Card>
```

## Mobile-First Design

All components are designed with mobile-first approach:

- **Touch targets**: Minimum 44px height for buttons and inputs
- **Responsive spacing**: Uses Tailwind's responsive classes (sm:, lg:, etc.)
- **Flexible layouts**: Components adapt to different screen sizes
- **Accessible**: Focus states, proper contrast, semantic HTML

## Accessibility

- Focus rings on interactive elements
- Proper label associations for inputs
- Semantic HTML structure
- Color contrast compliance
- Keyboard navigation support

## Tailwind CSS Integration

All components use Tailwind CSS utility classes for styling. Ensure Tailwind CSS is properly configured in your project.

## Demo

Visit `/components-demo` to see all components in action with various configurations and states.
