import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCandidatoProfile } from '@/services/candidato'
import { getUserData } from '@/utils/auth'

interface ProfileContextType {
  fotoPerfil: string | null
  updateFotoPerfil: (url: string) => void
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)

  const loadProfile = async () => {
    try {
      // Solo cargar perfil si el usuario es candidato
      const userData = getUserData()
      if (!userData?.candidato) {
        return
      }
      
      const profile = await getCandidatoProfile()
      setFotoPerfil(profile.foto_perfil_url)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const updateFotoPerfil = (url: string) => {
    setFotoPerfil(url)
  }

  const refreshProfile = async () => {
    await loadProfile()
  }

  return (
    <ProfileContext.Provider value={{ fotoPerfil, updateFotoPerfil, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
