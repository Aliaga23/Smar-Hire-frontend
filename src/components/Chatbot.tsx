import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Trash2, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { sendMessage, clearSession, type ChatHistory } from '@/services/chatbot'
import { toast } from 'sonner'

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatHistory[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll al último mensaje con animación suave
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  // Mantener el foco en el input después de enviar
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')

    // Agregar mensaje del usuario al chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setIsLoading(true)
    try {
      const messageDto: { mensaje: string; sessionId?: string } = {
        mensaje: userMessage
      }
      
      // Solo incluir sessionId si existe
      if (sessionId) {
        messageDto.sessionId = sessionId
      }

      const response = await sendMessage(messageDto)

      // Guardar sessionId si es nueva sesión
      if (!sessionId) {
        setSessionId(response.sessionId)
      }

      // Agregar respuesta del bot
      setMessages(prev => [...prev, { role: 'assistant', content: response.respuesta }])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar mensaje')
      // Remover el mensaje del usuario si hubo error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (sessionId) {
      try {
        await clearSession(sessionId)
        toast.success('Conversación limpiada')
      } catch (error) {
        console.error('Error clearing session:', error)
      }
    }
    setMessages([])
    setSessionId(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 z-50 bg-gradient-to-r from-primary to-primary/80"
          size="icon"
        >
          <MessageCircle className="h-7 w-7 animate-pulse" />
        </Button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 duration-300 bg-background rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-primary to-primary/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-white text-primary">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">Asistente SmartHire</h3>
                <p className="text-xs text-white/80">En línea</p>
              </div>
            </div>
            <div className="flex gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-0 flex flex-col overflow-hidden bg-gradient-to-b from-muted/20 to-background">
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={scrollRef} style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="bg-primary/10 rounded-full p-6 mb-4">
                    <Bot className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    ¡Hola!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Soy tu asistente virtual de SmartHireSolutions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pregúntame sobre cómo usar la plataforma, postularte a vacantes, completar tu perfil o cualquier otra duda
                  </p>
                  <div className="mt-6 w-full space-y-2">
                    <button
                      onClick={() => setInputMessage('¿Cómo puedo postularme a una vacante?')}
                      className="w-full text-left text-xs p-3 rounded-xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-200 hover:shadow-sm"
                    >
                      <span className="font-medium">¿Cómo puedo postularme a una vacante?</span>
                    </button>
                    <button
                      onClick={() => setInputMessage('¿Cómo completo mi perfil?')}
                      className="w-full text-left text-xs p-3 rounded-xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-200 hover:shadow-sm"
                    >
                      <span className="font-medium">¿Cómo completo mi perfil?</span>
                    </button>
                    <button
                      onClick={() => setInputMessage('¿Qué es el matching de la plataforma?')}
                      className="w-full text-left text-xs p-3 rounded-xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-200 hover:shadow-sm"
                    >
                      <span className="font-medium">¿Qué es el matching de la plataforma?</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
                            : 'bg-white dark:bg-muted rounded-tl-sm border border-muted-foreground/10'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${
                          msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        }`}>
                          {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 justify-start animate-in fade-in-0 duration-300">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-muted rounded-2xl rounded-tl-sm px-5 py-3 shadow-md border border-muted-foreground/10">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input de mensaje */}
            <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-2 focus-visible:ring-primary"
                  autoFocus
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
