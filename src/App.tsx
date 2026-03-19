import { Routes, Route, Link } from "react-router-dom"
import { FileText, Moon, Sun } from "lucide-react"
import { useTheme } from "./components/theme-provider"
import { Button } from "./components/ui/button"
import Home from "./pages/Home"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import EthicalUsePolicy from "./pages/EthicalUsePolicy"
import CookieBanner from "./components/CookieBanner"

export default function App() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <FileText className="h-6 w-6" />
            <span>EasyInvoice</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/ethical-use-policy" element={<EthicalUsePolicy />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background mt-4">
        <div className="container flex flex-col items-center justify-center space-y-4">
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/ethical-use-policy" className="hover:text-primary transition-colors">Ethical Use Policy</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Created by{" "}
            <a
              href="https://github.com/JoeMighty"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              JoeMighty
            </a>
          </p>
        </div>
      </footer>
      <CookieBanner />
    </div>
  )
}
