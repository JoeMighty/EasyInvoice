import { useRef, useState } from "react"
import { Download, Loader2, Share } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { useInvoice } from "../context/InvoiceContext"
import { Button } from "./ui/button"

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#ffffff"
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6) return "#ffffff"
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? "#0f172a" : "#ffffff"
}

const translations: Record<string, Record<string, string>> = {
  en: {
    invoice: "INVOICE",
    billedTo: "Billed To",
    dateIssued: "Date Issued",
    dueDate: "Due Date",
    description: "Description",
    rate: "Rate",
    qty: "Qty",
    amount: "Amount",
    subtotal: "Subtotal",
    discount: "Discount",
    totalDue: "Total Due",
    notes: "Notes"
  },
  es: {
    invoice: "FACTURA",
    billedTo: "Facturado a",
    dateIssued: "Fecha de Emisión",
    dueDate: "Fecha Venc.",
    description: "Descripción",
    rate: "Precio",
    qty: "Cant.",
    amount: "Importe",
    subtotal: "Subtotal",
    discount: "Descuento",
    totalDue: "Total a Pagar",
    notes: "Notas"
  },
  fr: {
    invoice: "FACTURE",
    billedTo: "Facturé à",
    dateIssued: "Date d'Émission",
    dueDate: "Date d'Échéance",
    description: "Description",
    rate: "Prix",
    qty: "Qté",
    amount: "Montant",
    subtotal: "Sous-total",
    discount: "Remise",
    totalDue: "Total Dû",
    notes: "Notes"
  },
  de: {
    invoice: "RECHNUNG",
    billedTo: "Rechnung an",
    dateIssued: "Rechnungsdatum",
    dueDate: "Fälligkeitsdatum",
    description: "Beschreibung",
    rate: "Preis",
    qty: "Menge",
    amount: "Betrag",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    totalDue: "Gesamtbetrag",
    notes: "Notizen"
  }
}

export default function InvoicePreview() {
  const { invoice } = useInvoice()
  const printRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )

  const getTaxAmount = (rate: number) => subtotal * (rate / 100)
  
  const totalTaxAmount = invoice.taxes.reduce(
    (sum, tax) => sum + getTaxAmount(tax.rate),
    0
  )

  const discountAmount = invoice.discount.type === "percentage" 
    ? subtotal * (invoice.discount.amount / 100)
    : invoice.discount.amount

  const total = subtotal + totalTaxAmount - discountAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      // Create date without timezone adjustment issues by using split
      const [year, month, day] = dateString.split("-").map(Number)
      if (!year || !month || !day) return dateString
      // month is 0-indexed in Date constructor
      const date = new Date(year, month - 1, day)
      return format(date, invoice.dateFormat || "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current) return

    try {
      setIsGenerating(true)
      
      const element = printRef.current
      const originalStyle = element.getAttribute("style") || ""
      element.setAttribute("style", `${originalStyle}; width: 800px; padding: 40px;`)

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      element.setAttribute("style", originalStyle)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${invoice.details.invoiceNumber || "invoice"}.pdf`)
    } catch (error) {
      console.error("Error generating PDF", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    const title = `Invoice ${invoice.details.invoiceNumber || ""}`.trim()
    const text = `Please find attached the invoice ${invoice.details.invoiceNumber || ""} from ${invoice.business.name || "us"}.`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        })
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`)
    }
  }

  const isModern = invoice.template === "modern"
  const isClassic = invoice.template === "classic"
  const t = translations[invoice.language || "en"] || translations["en"]

  const containerClass = `w-full max-w-[800px] mx-auto bg-white text-slate-800 space-y-4 sm:space-y-8 ${
    isModern ? "p-0" : "p-4 sm:p-8"
  }`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 sticky top-16 sm:top-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-4 sm:px-0 sm:static sm:bg-transparent rounded-lg sm:rounded-none mb-4 shadow-sm sm:shadow-none border sm:border-0">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4 sm:mb-0">Preview</h2>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-border/50">
        <div className="p-2 sm:p-4 md:p-8 overflow-hidden">
          <div
            ref={printRef}
            className={containerClass}
            style={{ 
              minHeight: "800px", 
              fontFamily: invoice.fontFamily === "Serif" ? "serif" : invoice.fontFamily === "Mono" ? "monospace" : "inherit"
            }}
          >
            {/* Header Section */}
            <div 
              className={`${isModern ? "p-4 sm:p-8" : "pb-6 sm:pb-8 border-b border-slate-200"} flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 transition-colors`}
              style={isModern ? { backgroundColor: invoice.themeColor, color: getContrastColor(invoice.themeColor) } : {}}
            >
              <div className="space-y-4">
                {invoice.business.logo && (
                  <img src={invoice.business.logo} alt="Business Logo" className="max-h-20 object-contain" />
                )}
                <div className="space-y-1">
                  <h1 className={`text-4xl font-bold tracking-tight ${isModern ? "text-inherit" : "text-slate-900"}`}>
                    {t.invoice}
                  </h1>
                  <p className={`text-sm font-medium ${isModern ? "opacity-80" : "text-slate-500"}`}>
                    #{invoice.details.invoiceNumber || "INV-000"}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <h3 className={`font-semibold text-lg ${isModern ? "text-inherit" : "text-slate-900"}`}>
                  {invoice.business.name || "Business Name"}
                </h3>
                {invoice.business.email && (
                  <p className={`text-sm ${isModern ? "opacity-80" : "text-slate-500"}`}>{invoice.business.email}</p>
                )}
                {invoice.business.address && (
                  <p className={`text-sm whitespace-pre-wrap ${isModern ? "opacity-80" : "text-slate-500"}`}>
                    {invoice.business.address}
                  </p>
                )}
              </div>
            </div>

            {/* Dates & Client */}
            <div className={`flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 ${isModern ? "px-4 sm:px-8 py-4" : "py-4"}`}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {t.billedTo}
                  </p>
                  <h4 className="font-semibold text-slate-900">
                    {invoice.client.name || "Client Name"}
                  </h4>
                  {invoice.client.email && (
                    <p className="text-sm text-slate-600">
                      {invoice.client.email}
                    </p>
                  )}
                  {invoice.client.address && (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {invoice.client.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-500">{t.dateIssued}</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(invoice.details.issueDate)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-500">{t.dueDate}</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(invoice.details.dueDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className={`${isModern ? "px-4 sm:px-8" : "py-4"}`}>
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className={`${isClassic ? "border-y-2 border-slate-800" : "border-y border-slate-200"} text-slate-500 bg-slate-50`}>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold uppercase tracking-wider w-1/2">
                      {t.description}
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold uppercase tracking-wider text-right">
                      {t.rate}
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold uppercase tracking-wider text-right">
                      {t.qty}
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold uppercase tracking-wider text-right">
                      {t.amount}
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isClassic ? "divide-y divide-slate-800/10" : "divide-y divide-slate-200"}`}>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50">
                      <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-slate-900 break-words">
                        {item.description || "Item description"}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right text-slate-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-medium text-slate-900">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                  {invoice.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-500 italic"
                      >
                        No items added
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className={`flex justify-end pt-4 sm:pt-6 ${isModern ? "px-4 sm:px-8" : ""}`}>
              <div className="w-full sm:max-w-xs space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 px-4">
                  <span>{t.subtotal}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {invoice.taxes.map(tax => (
                  tax.rate > 0 && (
                    <div key={tax.id} className="flex justify-between text-slate-600 px-4">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">{formatCurrency(getTaxAmount(tax.rate))}</span>
                    </div>
                  )
                ))}
                {invoice.discount.amount > 0 && (
                  <div className="flex justify-between text-emerald-600 px-4">
                    <span>{t.discount} {invoice.discount.type === "percentage" ? `(${invoice.discount.amount}%)` : ""}</span>
                    <span className="font-medium">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div 
                  className={`flex justify-between ${isClassic ? "border-t-2 border-slate-800" : "border-t border-slate-200 bg-slate-50"} pt-3 pb-3 px-4 text-base font-bold transition-colors`}
                  style={isModern ? { backgroundColor: invoice.themeColor, color: getContrastColor(invoice.themeColor) } : { color: isClassic ? "inherit" : invoice.themeColor }}
                >
                  <span>{t.totalDue}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className={`pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-100 ${isModern ? "px-4 sm:px-8 pb-4 sm:pb-8" : ""}`}>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t.notes}
                </p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
