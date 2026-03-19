export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Terms of Service</h1>
      
      <div className="space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6">1. Acceptance of Terms</h2>
        <p>
          By accessing and using EasyInvoice, you agree to be bound by these Terms of Service. If you do not agree with any part of the terms, you must not use the application.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6">2. Service Description</h2>
        <p>
          EasyInvoice provides a web-based tool for generating invoice documents in PDF format. The service is provided "as is" without any guarantees of uninterrupted availability or data retention.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6">3. User Responsibility</h2>
        <p>
          You are solely responsible for the accuracy and legality of the invoices you generate using this tool. EasyInvoice, its creators, and contributors are not liable for any discrepancies, tax implications, or disputes arising from the use of the generated documents.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6">4. Modifications</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. Continued use of the application after any such changes constitutes your acceptance of the new Terms of Service.
        </p>
      </div>
    </div>
  )
}
