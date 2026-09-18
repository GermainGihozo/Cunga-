# Layout Components

A complete set of responsive layout components for the Cunga dashboard application.

## Components

### DashboardLayout

The main layout wrapper that combines Navbar, Sidebar, and Footer with responsive behavior.

**Usage:**
```tsx
import { DashboardLayout } from '@components/layout'

// In your routes
<Route path="/admin/*" element={<DashboardLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
</Route>
```

**Features:**
- Responsive sidebar (280px on desktop, overlay on mobile)
- Integrated navbar with user menu
- Footer with links
- Proper spacing and content area
- Mobile-friendly with hamburger menu

---

### Navbar

Top navigation bar with user menu, notifications, and mobile menu toggle.

**Props:**
- `onMenuClick?: () => void` - Callback for mobile menu button
- `showMenuButton?: boolean` - Show/hide menu button (default: `true`)

**Features:**
- User profile dropdown with avatar
- Notifications dropdown with count badge
- Responsive design with mobile considerations
- Cunga branding with logo
- Logout functionality
- Role badge display
- Click-outside to close dropdowns

**Usage:**
```tsx
<Navbar onMenuClick={toggleSidebar} />
```

---

### Sidebar

Collapsible sidebar navigation with role-based menu items.

**Props:**
- `isOpen: boolean` - Controls sidebar visibility
- `onClose: () => void` - Callback when sidebar should close

**Features:**
- Role-based navigation (Admin vs Branch)
- Active route highlighting
- Badge support for notifications
- Branch info display (for branch users)
- Help section with documentation link
- Smooth animations
- Mobile overlay
- Responsive (fixed on desktop, overlay on mobile)

**Navigation Items:**

Admin:
- Dashboard
- Users
- Branches
- Analytics
- Reports
- Settings

Branch:
- Dashboard
- Products
- Sales
- Deposits
- Reports
- Online Requests (with badge)

**Usage:**
```tsx
<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
```

---

### Footer

Application footer with branding and links.

**Features:**
- Cunga branding
- Quick links section
- Support links section
- Privacy/Terms links
- Copyright notice
- Responsive grid layout
- Auto-updating year

**Usage:**
```tsx
<Footer />
```

---

## Responsive Behavior

### Mobile (< 1024px)
- Sidebar is hidden by default
- Hamburger menu button shown in navbar
- Sidebar appears as overlay when opened
- Click outside or close button to dismiss

### Desktop (≥ 1024px)
- Sidebar always visible (280px width)
- Content area adjusted with `ml-64` margin
- No hamburger menu button
- Fixed sidebar position

---

## Styling

All components use:
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Cunga brand colors** from tailwind.config.js
- **Custom animations** (fade-in, scale-in)
- **Gradient utilities** for branding

---

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Semantic HTML
- Screen reader friendly

---

## Integration

The layout is integrated with:
- **React Router** - for navigation and active routes
- **Redux** - for auth state (user info, role)
- **useAuth hook** - for user data and logout
- **Common components** - Card, Badge, Button
- **Type safety** - Full TypeScript support

---

## File Structure

```
layout/
├── DashboardLayout.tsx  # Main layout wrapper
├── Navbar.tsx           # Top navigation
├── Sidebar.tsx          # Side navigation
├── Footer.tsx           # Application footer
├── index.ts             # Exports
└── README.md            # This file
```

---

## Customization

### Colors
Colors are defined in `tailwind.config.js`:
- Primary: Indigo (#6366F1)
- Secondary: Pink (#EC4899)

### Sidebar Width
Currently 280px (w-64). To change:
1. Update sidebar className: `w-64` → `w-72`
2. Update main content margin: `lg:ml-64` → `lg:ml-72`

### Navbar Height
Currently 64px (h-16). Consistent across layout.

---

## Examples

### Custom Dashboard Page
```tsx
import { Card } from '@components/common'

const MyDashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome!</p>
      </div>
      
      <Card>
        Content here
      </Card>
    </div>
  )
}
```

### Adding New Sidebar Link
```tsx
// In Sidebar.tsx, add to adminNavItems or branchNavItems
{
  label: 'Analytics',
  icon: <TrendingUp size={20} />,
  path: '/admin/analytics',
  roles: [UserRole.ADMIN],
  badge: '5', // Optional
}
```

---

## Notes

- Sidebar state is managed locally in DashboardLayout
- User data comes from Redux auth store
- All routes use nested routing with `<Outlet />`
- Layout automatically handles mobile/desktop transitions
- Dropdowns use click-outside pattern for UX
