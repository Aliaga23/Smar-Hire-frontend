import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCandidatoProfile } from '@/services/candidato'

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
