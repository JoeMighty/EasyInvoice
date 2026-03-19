import { FileText, Moon, Sun } from "lucide-react"
import { useTheme } from "./components/theme-provider"
import { Button } from "./components/ui/button"
import InvoiceForm from "./components/InvoiceForm"
import InvoicePreview from "./components/InvoicePreview"

function App() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <FileText className="h-6 w-6" />
            <span>EasyInvoice</span>
          </div>

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
      <main className="container grid lg:grid-cols-2 gap-8 py-8 items-start">
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6">
          <InvoiceForm />
        </div>

        {/* Right Column: Preview */}
        <div className="sticky top-24 lg:block flex flex-col gap-6">
          <InvoicePreview />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0 bg-background">
        <div className="container flex flex-col items-center justify-center h-16">
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
    </div>
  )
}

export default App
