import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { User, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoogleUserTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (userType: 'candidato' | 'empresa') => void
  type?: 'login' | 'register'
}

export default function GoogleUserTypeSelector({
  isOpen,
  onClose,
  onSelect,
  type = 'login'
}: GoogleUserTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'candidato' | 'empresa' | null>(null)

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType)
      onClose()
    }
  }

  const actionText = type === 'login' ? 'iniciar sesión' : 'registrarte'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cómo quieres {actionText}?</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de cuenta para continuar con Google
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedType === 'candidato' && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedType('candidato')}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedType === 'candidato' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Candidato</h3>
                  <p className="text-sm text-muted-foreground">
                    Busco oportunidades laborales
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedType === 'empresa' && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedType('empresa')}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedType === 'empresa' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Empresa/Reclutador</h3>
                  <p className="text-sm text-muted-foreground">
                    Busco candidatos para mi empresa
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedType}
            >
              Continuar con Google
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}