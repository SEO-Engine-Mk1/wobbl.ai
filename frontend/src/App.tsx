import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme-provider'
import AppRouter from './App-router'

function MainApp() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRouter />
      <Toaster />
    </ThemeProvider>
  )
}

export default MainApp