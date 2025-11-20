// Utilidades para manejo de autenticación y roles

export interface UserData {
  id: string
  name: string
  lastname: string
  correo: string
  telefono?: string
  fecha_nacimiento?: string
  candidato?: any
  reclutador?: {
    id: string
    posicion: string
    usuarioId: string
    empresaId: string
    empresa: {
      id: string
      name: string
      descripcion: string
      area: string
      creadorId: string
    }
  }
}

export const getUserData = (): UserData | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const getUserType = (): string | null => {
  return localStorage.getItem('userType')
}

export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole')
}

export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const isAdmin = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true'
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

export const isCandidato = (): boolean => {
  return getUserType() === 'candidato'
}

export const isReclutador = (): boolean => {
  return getUserType() === 'reclutador'
}

export const isEmpresaAdmin = (): boolean => {
  return isAdmin() && isReclutador()
}

export const getEmpresaId = (): string | null => {
  const user = getUserData()
  return user?.reclutador?.empresaId || null
}

export const getEmpresaData = () => {
  const user = getUserData()
  return user?.reclutador?.empresa || null
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userType')
  localStorage.removeItem('userRole')
  localStorage.removeItem('isAdmin')
}

// Hook para obtener información del usuario actual
export const useCurrentUser = () => {
  const userData = getUserData()
  const userType = getUserType()
  const userRole = getUserRole()
  const isAdminUser = isAdmin()
  const token = getToken()
  
  return {
    user: userData,
    userType,
    userRole,
    isAdmin: isAdminUser,
    isAuthenticated: isAuthenticated(),
    isCandidato: isCandidato(),
    isReclutador: isReclutador(),
    isEmpresaAdmin: isEmpresaAdmin(),
    empresaId: getEmpresaId(),
    empresaData: getEmpresaData(),
    token,
    logout
  }
}