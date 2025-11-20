import api from "@/lib/axios"

export interface Habilidad {
  id: string
  nombre: string
  categoriaId?: string
  categoria?: {
    id: string
    nombre: string
  }
}

// Obtener todas las habilidades
export async function getHabilidades(): Promise<Habilidad[]> {
  const { data } = await api.get("/habilidades")
  return data
}

// Obtener una habilidad por ID
export async function getHabilidad(id: string): Promise<Habilidad> {
  const { data } = await api.get(`/habilidades/${id}`)
  return data
}
