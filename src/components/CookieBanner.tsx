import { useState, useEffect } from "react"
import { Button } from "./ui/button"

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (consent !== "true") {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true")
    setShow(false)
    // Optionally trigger a manual save of current state here, or wait for next state update
    window.location.reload() // Quickest way to ensure all hooks pick up the new consent
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "false")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-800 shadow-xl text-slate-200">
      <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            <strong>We value your privacy.</strong> We use browser strictly necessary local storage to save your progress as you build your invoice. We do not use tracking cookies or transmit your data to any external servers.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline} className="text-slate-900 bg-white hover:bg-slate-100">
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} className="bg-indigo-600 hover:bg-indigo-700 text-white border-transparent">
            Accept & Save Progress
          </Button>
        </div>
      </div>
    </div>
  )
}
