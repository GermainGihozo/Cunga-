# Cunga UI Component Library

A comprehensive, reusable UI component library built with React, TypeScript, and TailwindCSS for the Cunga SaaS Platform.

## 🎨 Design Philosophy

- **Consistent**: All components follow Cunga's brand guidelines
- **Accessible**: WCAG 2.1 AA compliant with proper ARIA labels
- **Flexible**: Highly customizable with variants and props
- **Type-Safe**: Full TypeScript support with exported types
- **Responsive**: Mobile-first design approach

## 📦 Components

### Button
Versatile button component with multiple variants and states.

```tsx
import { Button } from '@components/common'

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// With icons
<Button leftIcon={<Plus />}>Add Item</Button>
<Button rightIcon={<ArrowRight />}>Next</Button>

// Loading state
<Button isLoading>Submitting...</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode

### Card
Container component with shadow and border variants.

```tsx
import { Card } from '@components/common'

<Card variant="default" padding="md" hoverable>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean

### Input
Text input with label, error states, and icons.

```tsx
import { Input } from '@components/common'

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail />}
  error={errors.email}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string
- `leftIcon`, `rightIcon`: React.ReactNode

### Select
Dropdown select component with options.

```tsx
import { Select } from '@components/common'

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
]

<Select
  label="Choose an option"
  options={options}
  placeholder="Select..."
/>
```

**Props:**
- `label`: string
- `options`: SelectOption[]
- `error`: string
- `placeholder`: string

### Textarea
Multi-line text input with character count.

```tsx
import { Textarea } from '@components/common'

<Textarea
  label="Description"
  rows={4}
  maxLength={200}
  showCount
  placeholder="Enter description..."
/>
```

**Props:**
- `label`: string
- `error`: string
- `maxLength`: number
- `showCount`: boolean

### Checkbox
Checkbox input with custom styling.

```tsx
import { Checkbox } from '@components/common'

<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helpText`: string

### Badge
Status indicator with color variants.

```tsx
import { Badge } from '@components/common'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info" dot>New</Badge>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'default'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean

### Modal
Accessible modal dialog with backdrop.

```tsx
import { Modal } from '@components/common'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to continue?</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `footer`: React.ReactNode

### Table
Data table with sorting and row click handling.

```tsx
import { Table } from '@components/common'

const columns = [
  { key: 'name', header: 'Name' },
  { 
    key: 'price', 
    header: 'Price',
    render: (item) => `$${item.price.toFixed(2)}`
  },
]

<Table
  data={products}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={(item) => console.log(item)}
  striped
  hoverable
/>
```

**Props:**
- `data`: T[]
- `columns`: Column<T>[]
- `keyExtractor`: (item: T) => string | number
- `onRowClick`: (item: T) => void
- `isLoading`: boolean
- `striped`, `hoverable`: boolean

### Spinner
Loading indicator with size and color options.

```tsx
import { Spinner } from '@components/common'

<Spinner size="md" color="primary" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'white' | 'gray'

### Alert
Alert message with variants and close button.

```tsx
import { Alert } from '@components/common'

<Alert variant="success" title="Success!" onClose={handleClose}>
  Your changes have been saved.
</Alert>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info'
- `title`: string
- `onClose`: () => void

### Pagination
Page navigation component.

```tsx
import { Pagination } from '@components/common'

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  maxVisible={5}
/>
```

**Props:**
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void
- `maxVisible`: number

### EmptyState
Empty state placeholder with action button.

```tsx
import { EmptyState } from '@components/common'

<EmptyState
  icon={<Package />}
  title="No products found"
  description="Get started by adding your first product."
  action={{
    label: 'Add Product',
    onClick: handleAddProduct
  }}
/>
```

**Props:**
- `icon`: React.ReactNode
- `title`: string
- `description`: string
- `action`: { label: string, onClick: () => void }

### Tooltip
Hover tooltip with positioning.

```tsx
import { Tooltip } from '@components/common'

<Tooltip content="Click to edit" position="top">
  <Button>Edit</Button>
</Tooltip>
```

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right'

## 🎨 Theming

All components use Cunga's brand colors defined in `tailwind.config.js`:

- **Primary**: Indigo (#6366F1)
- **Secondary**: Pink (#EC4899)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

## 🔧 Customization

All components accept a `className` prop for additional styling:

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>
```

Use the `cn()` utility function to merge classes properly:

```tsx
import { cn } from '@utils/cn'

<div className={cn('base-class', condition && 'conditional-class', className)}>
```

## ♿ Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader support

## 📝 Best Practices

1. **Import from index**: Always import from `@components/common` for tree-shaking
2. **Use TypeScript**: Leverage type safety with exported interfaces
3. **Ref forwarding**: All input components support ref forwarding
4. **Controlled components**: Prefer controlled over uncontrolled components
5. **Error handling**: Always provide error messages for form inputs

## 🧪 Testing

Components can be tested with React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@components/common'

test('button click handler', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByText('Click me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

## 📚 Component Showcase

Visit `/showcase` to see all components in action with interactive examples.

## 🤝 Contributing

When adding new components:

1. Follow existing component structure
2. Add TypeScript types and export them
3. Support ref forwarding when applicable
4. Include accessibility features
5. Add to index.ts for exports
6. Update this README

## 📄 License

MIT License - Part of the Cunga Platform
