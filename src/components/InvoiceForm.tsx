import { Plus, Trash2, GripVertical, Upload, FileText } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
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
    addTax,
    removeTax,
    updateTax,
    importData,
    exportData,
    lastSaved
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

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      
      const lines = text.split('\n')
      const newItems = []
      
      let startIdx = 0
      if (lines[0].toLowerCase().includes('description')) {
        startIdx = 1
      }

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        // Split by comma outside quotes
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        
        if (values.length >= 3) {
           newItems.push({
             id: uuidv4(),
             description: values[0].replace(/^"|"$/g, '').trim(),
             quantity: Number(values[1]) || 1,
             price: Number(values[2]) || 0
           })
        }
      }
      
      if (newItems.length > 0) {
        const currentItems = invoice.items.length === 1 && invoice.items[0].description === '' ? [] : invoice.items
        updateInvoice({ items: [...currentItems, ...newItems] })
      }
    }
    reader.readAsText(file)
    event.target.value = '' 
  }

  const downloadCsvTemplate = () => {
    const content = "Description,Quantity,Price\nWeb Design Services,1,1500\nHosting (1 Year),1,120\n"
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "invoice_items_template.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Invoice Settings</CardTitle>
            {lastSaved && <p className="text-xs text-slate-500 mt-1">Draft saved globally at {lastSaved}</p>}
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
             <div>
              <input
                type="file"
                accept=".json"
                id="json-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => importData(e.target?.result as string)
                    reader.readAsText(file)
                  }
                  e.target.value = ''
                }}
              />
              <Label
                htmlFor="json-upload"
                className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                aria-label="Import Backup JSON"
              >
                Import
              </Label>
            </div>
            <Button size="sm" variant="outline" onClick={exportData} aria-label="Export Backup JSON">Export</Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={invoice.template}
              onChange={(e) => updateInvoice({ template: e.target.value as any })}
              aria-label="Invoice Template"
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
          <div className="space-y-2">
            <Label htmlFor="themeColor">Theme Color</Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-1 py-1">
              <input
                id="themeColor"
                type="color"
                className="w-full h-full cursor-pointer rounded-sm border-0"
                value={invoice.themeColor}
                onChange={(e) => updateInvoice({ themeColor: e.target.value })}
                aria-label="Theme Color Picker"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <select
              id="fontFamily"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={invoice.fontFamily}
              onChange={(e) => updateInvoice({ fontFamily: e.target.value })}
              aria-label="Font Family"
            >
              <option value="Inter">Inter (Sans)</option>
              <option value="Serif">Serif</option>
              <option value="Mono">Monospace</option>
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Items</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={downloadCsvTemplate} size="sm" variant="ghost" className="text-slate-500 hidden sm:flex">
              <FileText className="h-4 w-4 mr-2" /> Template
            </Button>
            <div>
              <input
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={handleCsvUpload}
              />
              <Label
                htmlFor="csv-upload"
                className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" /> Import CSV
              </Label>
            </div>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
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
              <Label>Taxes</Label>
              {invoice.taxes.map(tax => (
                 <div key={tax.id} className="flex gap-2 items-center">
                   <Input 
                      value={tax.name} 
                      onChange={(e) => updateTax(tax.id, { name: e.target.value })} 
                      placeholder="Tax Name"
                      aria-label="Tax Name" 
                   />
                   <div className="relative w-24">
                     <Input 
                        type="number" 
                        min="0"
                        step="0.1"
                        value={tax.rate} 
                        onChange={(e) => updateTax(tax.id, { rate: Number(e.target.value) })} 
                        aria-label="Tax Rate Percentage" 
                        className="pr-6"
                     />
                     <span className="absolute right-2 top-2 text-slate-500 text-sm">%</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => removeTax(tax.id)} aria-label={`Remove ${tax.name}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                   </Button>
                 </div>
              ))}
              <Button onClick={addTax} size="sm" variant="outline" aria-label="Add Tax">
                <Plus className="h-4 w-4 mr-2" /> Add Tax
              </Button>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="discount">Discount</Label>
              <div className="flex gap-2">
                <select 
                  className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={invoice.discount.type}
                  onChange={(e) => updateInvoice({ discount: { ...invoice.discount, type: e.target.value as "fixed"|"percentage" } })}
                  aria-label="Discount Type"
                >
                  <option value="fixed">Flat ($)</option>
                  <option value="percentage">Percent (%)</option>
                </select>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoice.discount.amount}
                  onChange={(e) => updateInvoice({ discount: { ...invoice.discount, amount: Number(e.target.value) } })}
                  placeholder="0.00"
                  aria-label="Discount Amount"
                />
              </div>
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
