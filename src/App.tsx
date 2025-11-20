import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingNavbar } from "@/components/LandingNavbar"
import { Toaster } from "@/components/ui/sonner"
import { ProfileProvider } from "@/contexts/ProfileContext"
import { Chatbot } from "@/components/Chatbot"
import LandingPage from "@/pages/LandingPage"
import VacantesPublicas from "@/pages/VacantesPublicas"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import RegisterEmpresaPage from "@/pages/RegisterEmpresaPage"
import RegisterReclutador from "@/pages/RegisterReclutador"
import DashboardCandidato from "@/pages/DashboardCandidato"
import DashboardEmpresa from "@/pages/DashboardEmpresa"
import DashboardReclutador from "@/pages/DashboardReclutador"
import VacanteDetalleRouter from "@/pages/VacanteDetalleRouter"
import PerfilCandidato from "@/pages/PerfilCandidato"
import PerfilReclutador from "@/pages/PerfilReclutador"
import CrearVacante from "@/pages/CrearVacante"
import AdminPanel from "@/pages/AdminPanel"
import EditarPerfilCandidato from "@/pages/EditarPerfilCandidato"
import GestionarHabilidades from "@/pages/GestionarHabilidades"
import VacantesDisponibles from "@/pages/VacantesDisponibles"
import MisRecomendaciones from "@/pages/MisRecomendaciones"
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<><LandingNavbar /><LandingPage /></>} />
            <Route path="/vacantes" element={<VacantesPublicas />} />
            <Route path="/login" element={<><LandingNavbar /><LoginPage /></>} />
            <Route path="/signup" element={<><LandingNavbar /><SignupPage /></>} />
            <Route path="/register-empresa" element={<><LandingNavbar /><RegisterEmpresaPage /></>} />
            <Route path="/register/reclutador" element={<RegisterReclutador />} />
            <Route path="/dashboard-candidato" element={<DashboardCandidato />} />
            <Route path="/dashboard-empresa" element={<DashboardEmpresa />} />
            <Route path="/dashboard-reclutador" element={<DashboardReclutador />} />
            <Route path="/editar-perfil" element={<EditarPerfilCandidato />} />
            <Route path="/gestionar-habilidades" element={<GestionarHabilidades />} />
            <Route path="/vacantes-disponibles" element={<VacantesDisponibles />} />
            <Route path="/mis-recomendaciones" element={<MisRecomendaciones />} />
            <Route path="/vacante/:id" element={<VacanteDetalleRouter />} />
            <Route path="/perfil-candidato/:id" element={<PerfilCandidato />} />
            <Route path="/perfil" element={<PerfilReclutador />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/vacante/crear" element={<CrearVacante />} />
            <Route path="/vacante/editar/:id" element={<CrearVacante />} />
          </Routes>
          <Chatbot />
          <Toaster />
        </BrowserRouter>
      </ProfileProvider>
    </ThemeProvider>
  )
}

export default App
