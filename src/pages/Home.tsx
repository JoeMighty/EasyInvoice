import InvoiceForm from "../components/InvoiceForm"
import InvoicePreview from "../components/InvoicePreview"

export default function Home() {
  return (
    <div className="container mx-auto grid lg:grid-cols-2 gap-8 py-8 items-start">
      <div className="flex flex-col gap-6">
        <InvoiceForm />
      </div>

      <div className="sticky top-24 lg:block flex flex-col gap-6">
        <InvoicePreview />
      </div>
    </div>
  )
}
