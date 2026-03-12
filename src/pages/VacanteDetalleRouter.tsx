import { useCurrentUser } from "@/utils/auth"
import { Navigate } from "react-router-dom"
import VacanteDetalle from "./VacanteDetalle"
import VacanteDetalleCandidato from "./VacanteDetalleCandidato"

export default function VacanteDetalleRouter() {
  const { isAuthenticated, isReclutador, isEmpresaAdmin } = useCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si es reclutador, mostrar vista con postulaciones
  // Si es candidato, mostrar vista para postularse
  return isReclutador ? <VacanteDetalle isAdmin={isEmpresaAdmin} /> : <VacanteDetalleCandidato />
}
