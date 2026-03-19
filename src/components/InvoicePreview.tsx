import { useRef, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useInvoice } from "../context/InvoiceContext"
import { Button } from "./ui/button"

export default function InvoicePreview() {
  const { invoice } = useInvoice()
  const printRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )
  const taxAmount = subtotal * (invoice.taxRate / 100)
  const total = subtotal + taxAmount - invoice.discount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(amount)
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current) return

    try {
      setIsGenerating(true)
      
      // Temporarily set precise width for A4 proportion rendering
      const element = printRef.current
      const originalStyle = element.getAttribute("style") || ""
      element.setAttribute("style", `${originalStyle}; width: 800px; padding: 40px;`)

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      })

      // Restore original style
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

  // Template styles logic
  const isModern = invoice.template === "modern"
  const isClassic = invoice.template === "classic"

  const containerClass = `min-w-[600px] bg-white text-slate-800 space-y-8 ${
    isModern ? "p-0" : "p-8"
  }`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Preview</h2>
        <Button onClick={handleDownloadPdf} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-border/50">
        <div className="overflow-x-auto p-4 md:p-8">
          <div
            ref={printRef}
            className={containerClass}
            style={{ minHeight: "800px", fontFamily: isClassic ? "serif" : "inherit" }}
          >
            {/* Header Section */}
            <div className={`${isModern ? "bg-slate-900 text-white p-8" : "pb-8 border-b border-slate-200"} flex justify-between items-start`}>
              <div className="space-y-1">
                <h1 className={`text-4xl font-bold tracking-tight ${isModern ? "text-white" : "text-slate-900"}`}>
                  INVOICE
                </h1>
                <p className={`text-sm font-medium ${isModern ? "text-slate-300" : "text-slate-500"}`}>
                  #{invoice.details.invoiceNumber || "INV-000"}
                </p>
              </div>

              <div className="text-right space-y-1">
                <h3 className={`font-semibold text-lg ${isModern ? "text-white" : "text-slate-900"}`}>
                  {invoice.business.name || "Business Name"}
                </h3>
                {invoice.business.email && (
                  <p className={`text-sm ${isModern ? "text-slate-300" : "text-slate-500"}`}>{invoice.business.email}</p>
                )}
                {invoice.business.address && (
                  <p className={`text-sm whitespace-pre-wrap ${isModern ? "text-slate-300" : "text-slate-500"}`}>
                    {invoice.business.address}
                  </p>
                )}
              </div>
            </div>

            {/* Dates & Client */}
            <div className={`flex justify-between items-start ${isModern ? "px-8 py-4" : "py-4"}`}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Billed To
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
                  <p className="font-medium text-slate-500">Date Issued</p>
                  <p className="font-semibold text-slate-900">
                    {invoice.details.issueDate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-500">Due Date</p>
                  <p className="font-semibold text-slate-900">
                    {invoice.details.dueDate || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className={`${isModern ? "px-8" : "py-4"}`}>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className={`${isClassic ? "border-y-2 border-slate-800" : "border-y border-slate-200"} text-slate-500 bg-slate-50`}>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider w-1/2">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                      Rate
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right text-nowrap">
                      Qty
                    </th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right text-nowrap">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isClassic ? "divide-y divide-slate-800/10" : "divide-y divide-slate-200"}`}>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50">
                      <td className="py-4 px-4 font-medium text-slate-900 break-words">
                        {item.description || "Item description"}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-900">
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
            <div className={`flex justify-end pt-4 ${isModern ? "px-8" : ""}`}>
              <div className="w-full max-w-sm space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 px-4">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-slate-600 px-4">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 px-4">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatCurrency(invoice.discount)}
                    </span>
                  </div>
                )}
                <div className={`flex justify-between ${isClassic ? "border-t-2 border-slate-800" : "border-t border-slate-200 bg-slate-50"} pt-3 pb-3 px-4 text-base font-bold text-slate-900`}>
                  <span>Total Due</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className={`pt-8 mt-8 border-t border-slate-100 ${isModern ? "px-8 pb-8" : ""}`}>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Notes
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
