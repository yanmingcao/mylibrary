# Quick Start Guide - UI Components

## 📍 Component Locations

```
src/components/ui/
├── Button.tsx          - Button component with variants
├── Input.tsx           - Form input component
├── Card.tsx            - Card component with sub-components
├── index.ts            - Barrel export file
└── README.md           - Detailed documentation
```

## 🚀 Quick Import

```tsx
// Import individual components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardImage, CardBody, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';

// Or use barrel export
import { Button, Input, Card, CardImage, CardBody, CardTitle, CardDescription, CardFooter } from '@/components/ui';
```

## 💡 Usage Examples

### Button
```tsx
// Primary button
<Button variant="primary">Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Input
```tsx
// Basic input
<Input type="text" placeholder="Enter text" />

// With label
<Input label="Email" type="email" placeholder="you@example.com" />

// With error
<Input label="Password" type="password" error="Password is required" />

// With helper text
<Input label="Username" helperText="3-20 characters" />

// All together
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={error}
  helperText="We'll never share your email"
/>
```

### Card
```tsx
// Basic card
<Card>
  <CardBody>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardBody>
</Card>

// Card with image
<Card hoverable>
  <CardImage src="/book.jpg" alt="Book" />
  <CardBody>
    <CardTitle>Book Title</CardTitle>
    <CardDescription>Book description</CardDescription>
  </CardBody>
  <CardFooter>
    <Button variant="primary" size="sm">Borrow</Button>
    <Button variant="secondary" size="sm">Details</Button>
  </CardFooter>
</Card>

// Card grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {books.map(book => (
    <Card key={book.id} hoverable>
      <CardImage src={book.image} alt={book.title} />
      <CardBody>
        <CardTitle>{book.title}</CardTitle>
        <CardDescription>{book.description}</CardDescription>
      </CardBody>
      <CardFooter>
        <Button variant="primary" size="sm" fullWidth>Borrow</Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

## 📱 Demo Page

View all components in action:
- **URL**: `/components-demo`
- **File**: `src/app/components-demo/page.tsx`
- **Features**:
  - All button variants and sizes
  - Form inputs with validation
  - Book card grid
  - Responsive layout examples

## 🎨 Customization

### Modify Colors
Edit the color values in each component:
```tsx
// In Button.tsx
const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400',
};
```

### Modify Sizes
Edit the size styles in each component:
```tsx
// In Button.tsx
const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[44px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-6 py-4 text-lg min-h-[44px]',
};
```

### Add New Variants
Extend the component interfaces and add new style combinations:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'; // Add 'danger'
  // ...
}

const variantStyles = {
  primary: '...',
  secondary: '...',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
};
```

## ✅ Verification

All components have been verified:
- ✅ TypeScript compilation: 0 errors
- ✅ Next.js build: Successful
- ✅ Mobile responsiveness: Tested at 375px, 640px, 1024px+
- ✅ Touch targets: All 44px minimum
- ✅ Accessibility: Focus rings, labels, semantic HTML

## 📚 Documentation

- **Component Details**: `src/components/ui/README.md`
- **Implementation Summary**: `COMPONENTS_SUMMARY.md`
- **Verification Checklist**: `VERIFICATION_CHECKLIST.md`

## 🔧 Integration Tips

1. **Form Handling**: Use with React Hook Form or Formik
2. **State Management**: Use with Context API or Redux
3. **Styling**: Extend with Tailwind CSS utility classes
4. **Accessibility**: All components include proper ARIA attributes
5. **TypeScript**: Full type support for all props

## 📞 Support

For questions or issues:
1. Check the component README: `src/components/ui/README.md`
2. View the demo page: `/components-demo`
3. Review the implementation: Check the component source files

---

**Status**: ✅ Production Ready
**Last Updated**: January 29, 2026
**Version**: 1.0.0
