import './App.css'
import { Button } from "@/components/ui/button"
import { useTheme } from './hooks/useTheme'
import { Sun, Moon, Monitor } from 'lucide-react'

const icons = {
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
  system: <Monitor className="size-4" />,
}

function App() {
  const { theme, setTheme } = useTheme()
  return (
    <>
      foobarbz

      return (
      <div>
        <Button>click me</Button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 rounded-lg border border-border
                 bg-card px-3 py-2 text-sm text-foreground hover:bg-muted
                 transition-colors"
        >
          {icons[theme]}
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
      )
    </>
  )
}

export default App
