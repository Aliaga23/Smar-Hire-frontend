import { useCurrentUser } from "../utils/auth"
import { Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardCandidato() {
  const { isAuthenticated, isCandidato, user } = useCurrentUser()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!isCandidato) {
    return <Navigate to="/dashboard-empresa" replace />
  }
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Candidato</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido {user?.name} {user?.lastname}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Gestiona tu información personal y profesional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Perfil
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Buscar Empleos</CardTitle>
              <CardDescription>
                Encuentra oportunidades que se adapten a tu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Buscar
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mis Postulaciones</CardTitle>
              <CardDescription>
                Revisa el estado de tus aplicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Postulaciones
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* User data debug */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Información de Usuario:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}