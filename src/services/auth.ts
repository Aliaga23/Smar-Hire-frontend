import api from '@/lib/axios'

// Login
export const login = async (correo: string, password: string) => {
  const response = await api.post('/auth/login', { correo, password })
  return response.data
}

// Registro candidato
export const registerCandidato = async (userData: {
  name: string
  lastname: string
  correo: string
  password: string
  telefono?: string
  fecha_nacimiento?: string
  titulo?: string
  bio?: string
  ubicacion?: string
}) => {
  const response = await api.post('/auth/register/candidato', userData)
  return response.data
}

// Completar/actualizar candidato OAuth
export const completeCandidatoOAuth = async (userData: {
  name: string
  lastname: string
  correo: string
  password?: string
  telefono?: string
  fecha_nacimiento?: string
  titulo?: string
  bio?: string
  ubicacion?: string
}) => {
  const response = await api.put('/auth/complete/candidato', userData)
  return response.data
}

// Completar/actualizar empresa OAuth
export const completeEmpresaOAuth = async (empresaData: {
  name: string
  lastname: string
  correo: string
  password?: string
  telefono?: string
  nombreEmpresa: string
  descripcionEmpresa?: string
  areaEmpresa?: string
  posicion?: string
}) => {
  const response = await api.put('/auth/complete/empresa', empresaData)
  return response.data
}

// Registro empresa
export const registerEmpresa = async (empresaData: {
  nombreEmpresa: string
  descripcionEmpresa?: string
  areaEmpresa?: string
  name: string
  lastname: string
  correo: string
  password: string
  telefono?: string
  posicion?: string
}) => {
  const response = await api.post('/auth/register/empresa', empresaData)
  return response.data
}

// Obtener perfil
export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

// Forgot password - solicitar recuperación
export const forgotPassword = async (correo: string) => {
  const response = await api.post('/auth/forgot-password', { correo })
  return response.data
}

// Reset password - restablecer con token
export const resetPassword = async (token: string, nuevaPassword: string) => {
  const response = await api.post('/auth/reset-password', { token, nuevaPassword })
  return response.data
}

// Google OAuth - obtener URL de autorización
export const getGoogleAuthUrl = (userType: 'candidato' | 'empresa' = 'candidato') => {
  const baseUrl = 'http://localhost:3000/api/auth/google'
  return userType === 'candidato' 
    ? `${baseUrl}/candidato`
    : `${baseUrl}/empresa`
}

// Google OAuth - manejar callback y obtener datos del usuario
export const handleGoogleCallback = async () => {
  // El token ya viene del backend, solo necesitamos obtener los datos del usuario
  const response = await api.get('/auth/profile')
  return response.data
}