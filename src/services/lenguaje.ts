import api from "@/lib/axios"

export interface Lenguaje {
  id: string
  nombre: string
}

// Obtener todos los lenguajes/idiomas
export async function getLenguajes(): Promise<Lenguaje[]> {
  const { data } = await api.get("/lenguajes")
  return data
}

// Obtener un lenguaje por ID
export async function getLenguaje(id: string): Promise<Lenguaje> {
  const { data } = await api.get(`/lenguajes/${id}`)
  return data
}
