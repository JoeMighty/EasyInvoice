import { Plus, Trash2, GripVertical } from "lucide-react"
import { useInvoice } from "../context/InvoiceContext"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableLineItem({ item, updateItem, removeItem }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-end border-b pb-4 last:border-0 last:pb-0 relative group bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>
      <div className="space-y-2 flex-grow w-full pl-2 sm:pl-0">
        <Label className="sm:hidden">Description</Label>
        <Input
          placeholder="Item description"
          value={item.description}
          onChange={(e) => updateItem(item.id, { description: e.target.value })}
        />
      </div>
      <div className="flex gap-4 w-full sm:w-auto">
        <div className="space-y-2 w-24">
          <Label className="sm:hidden">Qty</Label>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 w-32">
          <Label className="sm:hidden">Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.price}
            onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive mb-[2px] self-end"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function InvoiceForm() {
  const {
    invoice,
    updateBusiness,
    updateClient,
    updateDetails,
    updateInvoice,
    addItem,
    removeItem,
    updateItem,
  } = useInvoice()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = invoice.items.findIndex((i) => i.id === active.id)
      const newIndex = invoice.items.findIndex((i) => i.id === over.id)
      updateInvoice({ items: arrayMove(invoice.items, oldIndex, newIndex) })
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={invoice.template}
              onChange={(e) => updateInvoice({ template: e.target.value as any })}
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={invoice.currency}
              onChange={(e) => updateInvoice({ currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <select
              id="dateFormat"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={invoice.dateFormat}
              onChange={(e) => updateInvoice({ dateFormat: e.target.value })}
            >
              <option value="MMM dd, yyyy">Jan 01, 2024</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="b-logo">Business Logo</Label>
            <Input
              id="b-logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    updateBusiness({ logo: reader.result as string })
                  }
                  reader.readAsDataURL(file)
                } else {
                  updateBusiness({ logo: null })
                }
              }}
            />
            {invoice.business.logo && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateBusiness({ logo: null })}
                className="mt-2 text-red-500"
              >
                Remove Logo
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-name">Business Name</Label>
            <Input
              id="b-name"
              placeholder="Your Business Name"
              value={invoice.business.name}
              onChange={(e) => updateBusiness({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="b-email">Email</Label>
              <Input
                id="b-email"
                type="email"
                placeholder="you@business.com"
                value={invoice.business.email}
                onChange={(e) => updateBusiness({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-address">Address</Label>
              <Input
                id="b-address"
                placeholder="City, State, Zip"
                value={invoice.business.address}
                onChange={(e) => updateBusiness({ address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Client Name</Label>
            <Input
              id="c-name"
              placeholder="Client Name"
              value={invoice.client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                placeholder="client@example.com"
                value={invoice.client.email}
                onChange={(e) => updateClient({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-address">Address</Label>
              <Input
                id="c-address"
                placeholder="City, State, Zip"
                value={invoice.client.address}
                onChange={(e) => updateClient({ address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inv-number">Invoice Number</Label>
            <Input
              id="inv-number"
              value={invoice.details.invoiceNumber}
              onChange={(e) => updateDetails({ invoiceNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-date">Issue Date</Label>
            <Input
              id="inv-date"
              type="date"
              value={invoice.details.issueDate}
              onChange={(e) => updateDetails({ issueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-due">Due Date</Label>
            <Input
              id="inv-due"
              type="date"
              value={invoice.details.dueDate}
              onChange={(e) => updateDetails({ dueDate: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pl-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={invoice.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 hidden sm:flex font-medium text-sm text-slate-500 pb-2 border-b">
                <div className="flex-grow">Description</div>
                <div className="w-24 shrink-0">Quantity</div>
                <div className="w-32 shrink-0 pr-12">Price</div>
              </div>
              {invoice.items.map((item) => (
                <SortableLineItem
                  key={item.id}
                  item={item}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Summary Rates & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Summary & Notes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                step="0.1"
                value={invoice.taxRate}
                onChange={(e) => updateInvoice({ taxRate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={invoice.discount}
                onChange={(e) => updateInvoice({ discount: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Payment terms, thank you message, etc."
              value={invoice.notes}
              onChange={(e) => updateInvoice({ notes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
