import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { startTransition } from 'react'
import { usePainel } from './PainelContext'

export function SidebarFormularios() {
  const {
    busca,
    setBusca,
    formulariosFiltrados,
    formulariosIsLoading,
    formulariosTotal,
    formularioSelecionadoId,
    setFormularioSelecionado,
    setVersaoEmEdicao,
    dialogCriarAberto,
    setDialogCriarAberto,
    criarFormularioForm,
    criarFormularioMutation,
    autorPadrao,
  } = usePainel()

  return (
    <aside className="space-y-4">
      <Card className="overflow-hidden border-slate-300/60 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
        <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_38%),linear-gradient(135deg,_#fff_20%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(135deg,_#1e293b_20%,_#0f172a_100%)]">
          <CardTitle className="text-xl text-slate-900 dark:text-slate-50">Centro de formulários</CardTitle>
          <CardDescription>
            Estruture rascunhos, publique versões e acompanhe a base dinâmica do produto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button className="w-full" onClick={() => setDialogCriarAberto(true)} type="button">
            Novo formulário
          </Button>

          <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar formulário</DialogTitle>
                <DialogDescription>
                  Cadastre a raiz do agregado. O schema vai nascer quando você abrir uma versão em rascunho.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={criarFormularioForm.handleSubmit(async (dados) => {
                  await criarFormularioMutation.mutateAsync({ ...dados, criadoPor: autorPadrao })
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" {...criarFormularioForm.register('titulo')} />
                  {criarFormularioForm.formState.errors.titulo ? (
                    <p className="text-sm text-rose-600">{criarFormularioForm.formState.errors.titulo.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" {...criarFormularioForm.register('descricao')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chave">Chave técnica</Label>
                  <Input id="chave" {...criarFormularioForm.register('chave')} />
                  {criarFormularioForm.formState.errors.chave ? (
                    <p className="text-sm text-rose-600">{criarFormularioForm.formState.errors.chave.message}</p>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button disabled={criarFormularioMutation.isPending} type="submit">
                    {criarFormularioMutation.isPending ? 'Criando...' : 'Salvar formulário'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            <Label htmlFor="busca">Buscar</Label>
            <Input id="busca" placeholder="Título ou chave" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-300/60 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
        <CardHeader>
          <CardDescription>{formulariosTotal} itens cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[520px]">
            <div className="space-y-3 pr-1 anim-stagger">
              {formulariosIsLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full anim-fade-in" />)
                : null}

              {formulariosFiltrados.map((formulario) => (
                <button
                  key={formulario.id}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    formularioSelecionadoId === formulario.id
                      ? 'border-sky-300 bg-sky-50 shadow-sm dark:border-sky-700 dark:bg-sky-950/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                  }`}
                  onClick={() => {
                    startTransition(() => {
                      setFormularioSelecionado(formulario.id)
                      setVersaoEmEdicao(undefined)
                    })
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="min-w-0 flex-1 line-clamp-2 text-sm text-slate-900 dark:text-slate-100">{formulario.titulo}</strong>
                    <div className="flex shrink-0 gap-1">
                      {formulario.arquivado ? <Badge variant="secondary">Arquivado</Badge> : null}
                      {!formulario.ativo
                        ? <Badge variant="outline" className="border-amber-400 text-amber-700">Inativo</Badge>
                        : (!formulario.arquivado ? <Badge>Ativo</Badge> : null)}
                    </div>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{formulario.chave}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{formulario.descricao || 'Sem descrição cadastrada.'}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  )
}
