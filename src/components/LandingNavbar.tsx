import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, User, LogIn, UserPlus, Building2 } from "lucide-react"
import { Link } from "react-router-dom"

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">SmartHire</h1>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link to="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
              Empleos
            </Link>
            <Link to="/companies" className="text-sm font-medium hover:text-primary transition-colors">
              Empresas
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              Nosotros
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar sesión
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/signup" className="cursor-pointer">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registro Candidato
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register-empresa" className="cursor-pointer">
                    <Building2 className="h-4 w-4 mr-2" />
                    Registro Empresa
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
