"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWorkspaceStore } from "@/context/workspace-store"

interface DeletePlanDialogProps {
  planId: string
  planTitle: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDeleted?: () => void
}

export function DeletePlanDialog({
  planId,
  planTitle,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onDeleted,
}: DeletePlanDialogProps) {
  const { deletePlan } = useWorkspaceStore()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const ok = await deletePlan(planId)
      if (ok) {
        setIsOpen(false)
        onDeleted?.()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="font-display text-lg/md font-bold text-ink">
                Excluir Plano de Mudança?
              </DialogTitle>
              <span className="font-mono text-xs/xs text-ink-muted">
                Ação irreversível
              </span>
            </div>
          </div>
          <DialogDescription className="mt-2 font-sans text-sm text-ink-secondary leading-relaxed">
            Tem certeza de que deseja excluir o plano{" "}
            <strong className="text-ink font-bold">“{planTitle}”</strong>?
            Todas as tarefas, checklists e cronogramas vinculados a esta rota serão
            permanentemente apagados do banco de dados.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Excluir Definitivamente</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
