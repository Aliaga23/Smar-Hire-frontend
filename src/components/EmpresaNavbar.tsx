import { Building2, Search, User, LogOut, Settings, Users, Briefcase } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { useCurrentUser } from "@/utils/auth"

export function EmpresaNavbar() {
  const navigate = useNavigate()
  const { user, empresaData, isEmpresaAdmin, logout } = useCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name && user?.lastname 
    ? `${user.name[0]}${user.lastname[0]}`.toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo y empresa */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard-empresa" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">{empresaData?.name}</span>
              <span className="text-xs text-muted-foreground">SmartHire</span>
            </div>
          </Link>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard-empresa">
                <Briefcase className="h-4 w-4 mr-2" />
                Vacantes
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidatos">
                <Users className="h-4 w-4 mr-2" />
                Candidatos
              </Link>
            </Button>
            {isEmpresaAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Administración
                </Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Búsqueda y acciones */}
        <div className="flex items-center gap-2">
          {/* Barra de búsqueda */}
          <div className="hidden lg:flex items-center relative w-64">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar candidatos..."
              className="pl-8 h-9"
            />
          </div>

          {/* Theme toggle */}
          <ModeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-xs">
                  <span className="font-medium">{user?.name} {user?.lastname}</span>
                  <span className="text-muted-foreground">
                    {isEmpresaAdmin ? 'Administrador' : 'Reclutador'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name} {user?.lastname}</p>
                  <p className="text-xs text-muted-foreground">{user?.correo}</p>
                  {isEmpresaAdmin && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      Administrador
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/configuracion" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              {isEmpresaAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Panel de Administración
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
