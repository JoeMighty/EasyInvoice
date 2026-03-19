import * as React from "react"
import { v4 as uuidv4 } from "uuid"
import { addDays, format } from "date-fns"

export type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
}

export type InvoiceState = {
  business: {
    name: string
    email: string
    address: string
    logo: string | null
  }
  client: {
    name: string
    email: string
    address: string
  }
  details: {
    invoiceNumber: string
    issueDate: string
    dueDate: string
  }
  items: LineItem[]
  taxRate: number
  discount: number
  notes: string
  currency: string
  template: "default" | "modern" | "classic"
}

const defaultState: InvoiceState = {
  business: {
    name: "",
    email: "",
    address: "",
    logo: null,
  },
  client: {
    name: "",
    email: "",
    address: "",
  },
  details: {
    invoiceNumber: "INV-001",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
  },
  items: [
    {
      id: uuidv4(),
      description: "",
      quantity: 1,
      price: 0,
    },
  ],
  taxRate: 0,
  discount: 0,
  notes: "",
  currency: "USD",
  template: "default",
}

type InvoiceContextType = {
  invoice: InvoiceState
  updateInvoice: (updates: Partial<InvoiceState>) => void
  updateBusiness: (updates: Partial<InvoiceState["business"]>) => void
  updateClient: (updates: Partial<InvoiceState["client"]>) => void
  updateDetails: (updates: Partial<InvoiceState["details"]>) => void
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<LineItem>) => void
}

const InvoiceContext = React.createContext<InvoiceContextType | undefined>(
  undefined
)

const STORAGE_KEY = "easyinvoice-data"

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoice, setInvoice] = React.useState<InvoiceState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...defaultState, ...parsed } // Merge with default state to handle new keys when loading old data
      } catch (e) {
        console.error("Failed to parse invoice state from local storage", e)
      }
    }
    return defaultState
  })

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice))
  }, [invoice])

  const updateInvoice = React.useCallback(
    (updates: Partial<InvoiceState>) => {
      setInvoice((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  const updateBusiness = React.useCallback(
    (updates: Partial<InvoiceState["business"]>) => {
      setInvoice((prev) => ({
        ...prev,
        business: { ...prev.business, ...updates },
      }))
    },
    []
  )

  const updateClient = React.useCallback(
    (updates: Partial<InvoiceState["client"]>) => {
      setInvoice((prev) => ({ ...prev, client: { ...prev.client, ...updates } }))
    },
    []
  )

  const updateDetails = React.useCallback(
    (updates: Partial<InvoiceState["details"]>) => {
      setInvoice((prev) => ({
        ...prev,
        details: { ...prev.details, ...updates },
      }))
    },
    []
  )

  const addItem = React.useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: uuidv4(), description: "", quantity: 1, price: 0 },
      ],
    }))
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }, [])

  const updateItem = React.useCallback(
    (id: string, updates: Partial<LineItem>) => {
      setInvoice((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }))
    },
    []
  )

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        updateInvoice,
        updateBusiness,
        updateClient,
        updateDetails,
        addItem,
        removeItem,
        updateItem,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoice() {
  const context = React.useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider")
  }
  return context
}
