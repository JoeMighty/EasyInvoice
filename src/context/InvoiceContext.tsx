import * as React from "react"
import { v4 as uuidv4 } from "uuid"
import { addDays, format } from "date-fns"

export type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
}

export type Tax = {
  id: string
  name: string
  rate: number
}

export type SavedClient = {
  id: string
  name: string
  email: string
  address: string
}

export type SavedItem = {
  id: string
  description: string
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
  taxes: Tax[]
  discount: {
    type: "fixed" | "percentage"
    amount: number
  }
  notes: string
  currency: string
  template: "default" | "modern" | "classic"
  dateFormat: string
  themeColor: string
  fontFamily: string
  language: string
  savedClients: SavedClient[]
  savedItems: SavedItem[]
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
  taxes: [],
  discount: {
    type: "fixed",
    amount: 0,
  },
  notes: "",
  currency: "USD",
  template: "default",
  dateFormat: "MMM dd, yyyy",
  themeColor: "#4f46e5", // Default Indigo
  fontFamily: "Inter",
  language: "en",
  savedClients: [],
  savedItems: [],
}

type InvoiceContextType = {
  invoice: InvoiceState
  lastSaved: string | null
  updateInvoice: (updates: Partial<InvoiceState>) => void
  updateBusiness: (updates: Partial<InvoiceState["business"]>) => void
  updateClient: (updates: Partial<InvoiceState["client"]>) => void
  updateDetails: (updates: Partial<InvoiceState["details"]>) => void
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<LineItem>) => void
  addTax: () => void
  removeTax: (id: string) => void
  updateTax: (id: string, updates: Partial<Tax>) => void
  importData: (jsonData: string) => boolean
  exportData: () => void
  saveClient: (client: Omit<SavedClient, "id">) => void
  deleteSavedClient: (id: string) => void
  saveItem: (item: Omit<SavedItem, "id">) => void
  deleteSavedItem: (id: string) => void
}

const InvoiceContext = React.createContext<InvoiceContextType | undefined>(
  undefined
)

const STORAGE_KEY = "easyinvoice-data"

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [lastSaved, setLastSaved] = React.useState<string | null>(null)

  const [invoice, setInvoice] = React.useState<InvoiceState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migration from V2 to V3
        if (typeof parsed.taxRate === "number") {
          parsed.taxes = parsed.taxRate > 0 ? [{ id: uuidv4(), name: "Tax", rate: parsed.taxRate }] : []
          delete parsed.taxRate
        }
        if (typeof parsed.discount === "number") {
          parsed.discount = { type: "fixed", amount: parsed.discount }
        }
        return { ...defaultState, ...parsed, business: { ...defaultState.business, ...parsed.business }, client: { ...defaultState.client, ...parsed.client }, details: { ...defaultState.details, ...parsed.details } }
      } catch (e) {
        console.error("Failed to parse invoice state from local storage", e)
      }
    }
    return defaultState
  })

  React.useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (consent === "true") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice))
      setLastSaved(new Date().toLocaleTimeString())
    }
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
  
  const addTax = React.useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      taxes: [
        ...prev.taxes,
        { id: uuidv4(), name: "Tax", rate: 0 },
      ],
    }))
  }, [])

  const removeTax = React.useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      taxes: prev.taxes.filter((t) => t.id !== id),
    }))
  }, [])

  const updateTax = React.useCallback(
    (id: string, updates: Partial<Tax>) => {
      setInvoice((prev) => ({
        ...prev,
        taxes: prev.taxes.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }))
    },
    []
  )

  const importData = React.useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData)
      if (parsed && parsed.business && parsed.client) {
        setInvoice({ ...defaultState, ...parsed })
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }, [])

  const exportData = React.useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoice))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `easyinvoice_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }, [invoice])

  const saveClient = React.useCallback((client: Omit<SavedClient, "id">) => {
    setInvoice((prev) => ({
      ...prev,
      savedClients: [...(prev.savedClients || []), { ...client, id: uuidv4() }]
    }))
  }, [])

  const deleteSavedClient = React.useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      savedClients: (prev.savedClients || []).filter(c => c.id !== id)
    }))
  }, [])

  const saveItem = React.useCallback((item: Omit<SavedItem, "id">) => {
    setInvoice((prev) => ({
      ...prev,
      savedItems: [...(prev.savedItems || []), { ...item, id: uuidv4() }]
    }))
  }, [])

  const deleteSavedItem = React.useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      savedItems: (prev.savedItems || []).filter(i => i.id !== id)
    }))
  }, [])

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        lastSaved,
        updateInvoice,
        updateBusiness,
        updateClient,
        updateDetails,
        addItem,
        removeItem,
        updateItem,
        addTax,
        removeTax,
        updateTax,
        importData,
        exportData,
        saveClient,
        deleteSavedClient,
        saveItem,
        deleteSavedItem
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
