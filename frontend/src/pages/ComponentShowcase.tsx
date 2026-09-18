import { useState } from 'react'
import { Store, Plus, Edit, Trash2, Search } from 'lucide-react'
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Checkbox,
  Badge,
  Modal,
  Table,
  Spinner,
  Alert,
  Pagination,
  EmptyState,
  Tooltip,
} from '@components/common'

const ComponentShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Sample data for table
  const tableData = [
    { id: 1, name: 'Product 1', price: 29.99, stock: 50, status: 'active' },
    { id: 2, name: 'Product 2', price: 49.99, stock: 30, status: 'active' },
    { id: 3, name: 'Product 3', price: 19.99, stock: 0, status: 'out_of_stock' },
  ]

  const tableColumns = [
    { key: 'name', header: 'Product Name' },
    {
      key: 'price',
      header: 'Price',
      render: (item: any) => `$${item.price.toFixed(2)}`,
    },
    { key: 'stock', header: 'Stock' },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <Badge variant={item.status === 'active' ? 'success' : 'error'}>
          {item.status}
        </Badge>
      ),
    },
  ]

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Cunga UI Components
          </h1>
          <p className="text-gray-600">Reusable component library showcase</p>
        </div>

        {/* Buttons */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<Plus size={16} />}>With Left Icon</Button>
              <Button rightIcon={<Edit size={16} />}>With Right Icon</Button>
              <Button isLoading>Loading Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default">
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-gray-600 text-sm">With soft shadow</p>
            </Card>
            <Card variant="bordered">
              <h3 className="font-semibold mb-2">Bordered Card</h3>
              <p className="text-gray-600 text-sm">With border</p>
            </Card>
            <Card variant="elevated" hoverable>
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-gray-600 text-sm">Hoverable with shadow</p>
            </Card>
          </div>
        </Card>

        {/* Form Inputs */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input label="Text Input" placeholder="Enter text..." />
            <Input
              label="With Icon"
              placeholder="Search..."
              leftIcon={<Search size={20} />}
            />
            <Input
              label="With Error"
              placeholder="Enter email..."
              error="This field is required"
            />
            <Select label="Select Input" options={selectOptions} />
            <Textarea
              label="Textarea"
              placeholder="Enter description..."
              rows={4}
              maxLength={200}
              showCount
            />
            <Checkbox label="I agree to the terms and conditions" />
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="default">Default</Badge>
            <Badge variant="success" dot>
              With Dot
            </Badge>
          </div>
        </Card>

        {/* Alerts */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="success" title="Success!">
              Your operation completed successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please review your information before proceeding.
            </Alert>
            <Alert variant="error" title="Error">
              Something went wrong. Please try again.
            </Alert>
            <Alert variant="info" onClose={() => alert('Closed')}>
              This is an informational message with a close button.
            </Alert>
          </div>
        </Card>

        {/* Spinners */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Spinners</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Spinner size="sm" />
              <p className="text-xs text-gray-600 mt-2">Small</p>
            </div>
            <div className="text-center">
              <Spinner size="md" />
              <p className="text-xs text-gray-600 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-xs text-gray-600 mt-2">Large</p>
            </div>
            <div className="text-center bg-primary-600 p-4 rounded-lg">
              <Spinner size="md" color="white" />
              <p className="text-xs text-white mt-2">White</p>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Table</h2>
          <Table
            data={tableData}
            columns={tableColumns}
            keyExtractor={item => item.id}
            onRowClick={item => console.log('Clicked:', item)}
          />
        </Card>

        {/* Pagination */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pagination</h2>
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={setCurrentPage}
          />
        </Card>

        {/* Modal */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal Title"
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </>
            }
          >
            <p>This is the modal content. You can put any React components here.</p>
          </Modal>
        </Card>

        {/* Empty State */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Empty State</h2>
          <EmptyState
            icon={<Store />}
            title="No products found"
            description="Get started by adding your first product to the inventory."
            action={{
              label: 'Add Product',
              onClick: () => alert('Add product clicked'),
            }}
          />
        </Card>

        {/* Tooltip */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tooltips</h2>
          <div className="flex gap-4">
            <Tooltip content="Tooltip on top" position="top">
              <Button>Hover me (Top)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" position="bottom">
              <Button>Hover me (Bottom)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" position="left">
              <Button>Hover me (Left)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" position="right">
              <Button>Hover me (Right)</Button>
            </Tooltip>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ComponentShowcase
