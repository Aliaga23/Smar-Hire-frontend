import { useCurrentUser } from "@/utils/auth"
import VacanteDetalle from "./VacanteDetalle"
import VacanteDetalleCandidato from "./VacanteDetalleCandidato"

export default function VacanteDetalleRouter() {
  const { isReclutador } = useCurrentUser()

  // Si es reclutador, mostrar vista con postulaciones
  // Si es candidato, mostrar vista para postularse
  return isReclutador ? <VacanteDetalle /> : <VacanteDetalleCandidato />
}
