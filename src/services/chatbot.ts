import api from '@/lib/axios'

export interface ChatMessageDto {
  mensaje: string
  sessionId?: string
  contexto?: {
    pagina: string
    seccion?: string
    accion?: string
  }
}

export interface ChatResponse {
  sessionId: string
  respuesta: string
}

export interface ChatHistory {
  role: 'user' | 'assistant'
  content: string
}

export const sendMessage = async (messageDto: ChatMessageDto): Promise<ChatResponse> => {
  // Solo incluir sessionId si tiene valor
  const body: any = { mensaje: messageDto.mensaje }
  if (messageDto.sessionId) {
    body.sessionId = messageDto.sessionId
  }
  if (messageDto.contexto) {
    body.contexto = messageDto.contexto
  }
  const response = await api.post('/chatbot/chat', body)
  return response.data
}

export const getSessionHistory = async (sessionId: string): Promise<ChatHistory[]> => {
  const response = await api.get(`/chatbot/session/${sessionId}/history`)
  return response.data
}

export const clearSession = async (sessionId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/chatbot/session/${sessionId}`)
  return response.data
}
