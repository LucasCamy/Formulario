import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { startTransition } from 'react'
import { Link } from 'react-router-dom'
import { gerarRotuloStatus, usePainel } from './PainelContext'

export function FormularioBuilderHeader() {
  const {
    builderData,
    formularioSelecionadoId,
    versaoEmEdicao,
    versaoEmEdicaoId,
    setVersaoEmEdicao,
    criarVersaoMutation,
    publicarVersaoMutation,
    arquivarFormularioMutation,
    desativarFormularioMutation,
    ativarFormularioMutation,
    editarFormularioForm,
    excluirFormularioMutation,
    setDialogEditarFormularioAberto,
    setConfirmacaoPublicar,
    setConfirmacaoArquivar,
    setConfirmacaoDesativar,
    setConfirmacaoExcluirFormulario,
    setConfirmacaoRemoverVersao,
  } = usePainel()

  if (!builderData) return null

  return (
    <Card className="overflow-hidden border-slate-300/60 bg-white/95 shadow-sm anim-fade-up dark:border-slate-700/60 dark:bg-slate-900/95">
      <CardHeader className="bg-[linear-gradient(120deg,_rgba(16,185,129,0.12),_rgba(14,165,233,0.1)_55%,_transparent)] dark:bg-[linear-gradient(120deg,_rgba(16,185,129,0.08),_rgba(14,165,233,0.06)_55%,_transparent)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-3xl tracking-tight text-slate-900 dark:text-slate-50">{builderData.formulario.titulo}</CardTitle>
            <CardDescription className="max-w-2xl pt-1 text-slate-600 dark:text-slate-400">
              {builderData.formulario.descricao || 'Sem descrição.'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{builderData.formulario.chave}</Badge>
            {builderData.versaoPublicada ? (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                v{builderData.versaoPublicada.numeroVersao} publicada
              </Badge>
            ) : (
              <Badge variant="outline">Sem publicação</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            disabled={criarVersaoMutation.isPending || builderData.formulario.arquivado}
            onClick={() => criarVersaoMutation.mutate()}
            type="button"
          >
            {criarVersaoMutation.isPending ? 'Criando rascunho...' : 'Nova versão em rascunho'}
          </Button>
          <Button
            size="sm"
            disabled={
              !versaoEmEdicao ||
              versaoEmEdicao.statusPublicacao !== 'rascunho' ||
              publicarVersaoMutation.isPending ||
              builderData.formulario.arquivado
            }
            onClick={() => setConfirmacaoPublicar(true)}
            type="button"
            variant="secondary"
          >
            {publicarVersaoMutation.isPending ? 'Publicando...' : 'Publicar versão'}
          </Button>
          {builderData.versaoPublicada ? (
            <Link
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
              to={`/formularios/${builderData.formulario.chave}/preencher`}
            >
              Abrir formulário publicado
            </Link>
          ) : null}
          {versaoEmEdicao ? (
            <Link
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
              to={`/formularios/${formularioSelecionadoId}/versoes/${versaoEmEdicao.id}/submissoes`}
            >
              Ver respostas
            </Link>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="outline" type="button">
                  Ações <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={builderData.formulario.arquivado}
                onClick={() => {
                  editarFormularioForm.reset({
                    titulo: builderData.formulario.titulo,
                    descricao: builderData.formulario.descricao ?? '',
                  })
                  setDialogEditarFormularioAberto(true)
                }}
              >
                Editar formulário
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={builderData.formulario.arquivado || arquivarFormularioMutation.isPending}
                onClick={() => setConfirmacaoArquivar(true)}
              >
                Arquivar formulário
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {builderData.formulario.ativo ? (
                <DropdownMenuItem
                  disabled={desativarFormularioMutation.isPending}
                  onClick={() => setConfirmacaoDesativar(true)}
                >
                  Desativar formulário
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={ativarFormularioMutation.isPending}
                  onClick={() => ativarFormularioMutation.mutate()}
                >
                  Ativar formulário
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                disabled={excluirFormularioMutation.isPending}
                onClick={() => setConfirmacaoExcluirFormulario(true)}
              >
                Excluir formulário
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {builderData.formulario.versoes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Versões</p>
            <div className="flex flex-wrap gap-2 anim-stagger">
              {builderData.formulario.versoes.map((versao) => {
                const selecionada = versaoEmEdicaoId === versao.id
                return (
                  <div
                    key={versao.id}
                    role="button"
                    tabIndex={0}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      selecionada ? 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/60' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                    }`}
                    onClick={() => { if (!selecionada) startTransition(() => setVersaoEmEdicao(versao.id)) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (!selecionada) startTransition(() => setVersaoEmEdicao(versao.id))
                      }
                    }}
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">v{versao.numeroVersao}</span>
                    <Badge
                      variant={versao.statusPublicacao === 'publicada' ? 'default' : versao.statusPublicacao === 'arquivada' ? 'secondary' : 'outline'}
                      className={versao.statusPublicacao === 'publicada' ? 'bg-emerald-600 text-white hover:bg-emerald-600' : ''}
                    >
                      {gerarRotuloStatus(versao.statusPublicacao)}
                    </Badge>
                    {versao.statusPublicacao === 'rascunho' ? (
                      <button
                        type="button"
                        className="ml-1 rounded p-0.5 text-rose-400 hover:text-rose-600 focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); setConfirmacaoRemoverVersao(versao) }}
                        aria-label={`Remover versão ${versao.numeroVersao}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
            {versaoEmEdicao ? (
              <p className="text-xs text-slate-500">
                {versaoEmEdicao.statusPublicacao === 'rascunho'
                  ? `Editando v${versaoEmEdicao.numeroVersao} (rascunho). Campos e seções podem ser alterados.`
                  : `Visualizando v${versaoEmEdicao.numeroVersao} — somente leitura.`}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Ainda não existe rascunho aberto. Crie uma nova versão para montar o schema do formulário.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
