import './App.css'
import { Button } from "@/components/ui/button"
import { ArrowUpIcon } from "lucide-react"

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline mt-10 text-center">
        Hello world!
      </h1>
      <Button>
        <ArrowUpIcon />
        Click me
      </Button>
    </>
  )
}

export default App
