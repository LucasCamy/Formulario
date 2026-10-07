import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PRESETS_SECAO } from '@/features/formularios/presetsSecao'
import type { CampoFormularioSchema, TipoCampo } from '@/features/formularios/tipos'
import { obterMensagemErroApi } from '@/lib/api'
import { AlertCircle, MapPin, MoreHorizontal, User, Zap } from 'lucide-react'
import { OPCOES_MASCARA_NUMERICA, usePainel } from './PainelContext'

const ICONES_PRESET: Record<string, React.ReactNode> = {
  endereco: <MapPin className="h-4 w-4" />,
  'dados-pessoais': <User className="h-4 w-4" />,
}

export function BuilderTab() {
  const {
    versaoEmEdicao,
    adicionarSecaoForm,
    adicionarSecaoMutation,
    adicionarCampoForm,
    adicionarCampoMutation,
    aplicarPresetMutation,
    confirmacaoPreset,
    setConfirmacaoPreset,
    tipoCampoSelecionado,
    secaoSelecionada,
    mascaraSelecionada,
    builderData,
    editarSecaoForm,
    setDialogEditarSecaoAberto,
    setConfirmacaoRemoverSecao,
    setDialogEditarCampoAberto,
    setConfirmacaoRemoverCampo,
  } = usePainel()

  const secoesOrdenadas = versaoEmEdicao
    ? [...versaoEmEdicao.schema.secoes].sort((a, b) => a.ordem - b.ordem)
    : []

  const camposNumeroExistentes = versaoEmEdicao
    ? versaoEmEdicao.schema.secoes.flatMap((s) => s.campos).filter((c) => c.tipo === 'numero')
    : []

  const repeticaoCampoDep = adicionarCampoForm.watch('repeticaoCampoDependencia')

  return (
    <div className="space-y-4">
      {/* Presets de seção */}
      {versaoEmEdicao?.statusPublicacao === 'rascunho' ? (
        <Card className="border-indigo-200/60 bg-gradient-to-br from-indigo-50/60 to-white/95 shadow-sm anim-fade-up dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-slate-900/95">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base">Seções pré-configuradas</CardTitle>
            </div>
            <CardDescription>Adicione uma seção completa com campos, validações e máscaras já configurados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRESETS_SECAO.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={aplicarPresetMutation.isPending}
                  onClick={() => setConfirmacaoPreset(preset)}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/90 dark:hover:border-indigo-600"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 dark:group-hover:bg-indigo-800">
                    {ICONES_PRESET[preset.id] ?? <Zap className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{preset.titulo}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{preset.descricao}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{preset.campos.length} campos</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Confirmação de preset */}
      <AlertDialog open={confirmacaoPreset !== null} onOpenChange={(aberto) => { if (!aberto) setConfirmacaoPreset(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar seção "{confirmacaoPreset?.titulo}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Serão criados {confirmacaoPreset?.campos.length} campos pré-configurados com validações e máscaras.
              Você poderá editar, remover ou adicionar campos depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmacaoPreset(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={aplicarPresetMutation.isPending}
              onClick={() => {
                if (confirmacaoPreset) {
                  aplicarPresetMutation.mutate(confirmacaoPreset)
                  setConfirmacaoPreset(null)
                }
              }}
            >
              {aplicarPresetMutation.isPending ? 'Aplicando...' : 'Adicionar seção'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Nova seção */}
      {versaoEmEdicao?.statusPublicacao === 'rascunho' ? (
        <Card className="border-slate-300/60 bg-white/95 shadow-sm anim-fade-up dark:border-slate-700/60 dark:bg-slate-900/95">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nova seção</CardTitle>
            <CardDescription>Seções agrupam campos em cards visuais distintos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={adicionarSecaoForm.handleSubmit(async (dados) => {
                await adicionarSecaoMutation.mutateAsync(dados)
              })}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="secao-titulo">Título</Label>
                <Input id="secao-titulo" placeholder="Nome da seção" {...adicionarSecaoForm.register('titulo')} />
                {adicionarSecaoForm.formState.errors.titulo ? (
                  <p className="text-sm text-rose-600">{adicionarSecaoForm.formState.errors.titulo.message}</p>
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="secao-descricao">Descrição</Label>
                <Input id="secao-descricao" placeholder="Opcional" {...adicionarSecaoForm.register('descricao')} />
              </div>
              <Button size="sm" disabled={adicionarSecaoMutation.isPending} type="submit">
                {adicionarSecaoMutation.isPending ? 'Adicionando...' : 'Adicionar seção'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {/* Novo campo */}
      {versaoEmEdicao?.statusPublicacao === 'rascunho' ? (
      <Card className="border-slate-300/60 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Novo campo</CardTitle>
          <CardDescription>
            Adicione campos ao rascunho atual usando tipos do catálogo e regras simples de visibilidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={adicionarCampoForm.handleSubmit(async (dados) => {
              await adicionarCampoMutation.mutateAsync(dados)
            })}
          >
            {adicionarCampoMutation.isError ? (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 md:col-span-2 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{obterMensagemErroApi(adicionarCampoMutation.error, 'Erro ao adicionar campo.')}</p>
              </div>
            ) : null}
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="campo-chave">Chave</Label>
              <Input id="campo-chave" {...adicionarCampoForm.register('chave')} />
              {adicionarCampoForm.formState.errors.chave ? (
                <p className="text-sm text-rose-600">{adicionarCampoForm.formState.errors.chave.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="campo-rotulo">Rótulo</Label>
              <Input id="campo-rotulo" {...adicionarCampoForm.register('rotulo')} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Tipo</Label>
              <Select
                value={adicionarCampoForm.watch('tipo')}
                onValueChange={(valor) => adicionarCampoForm.setValue('tipo', valor as TipoCampo)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(val: string | null) => {
                      const tipo = builderData?.tiposCampoDisponiveis.find(
                        (t) => t.codigo.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase()) === val
                      )
                      return tipo?.nome ?? val ?? 'Selecione o tipo'
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {builderData?.tiposCampoDisponiveis.map((tipoCampo) => (
                    <SelectItem
                      key={tipoCampo.codigo}
                      value={tipoCampo.codigo.replace(/-([a-z])/g, (_, letra: string) => letra.toUpperCase()) as TipoCampo}
                      label={tipoCampo.nome}
                    >
                      {tipoCampo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {versaoEmEdicao && versaoEmEdicao.schema.secoes.length > 1 ? (
              <div className="space-y-2 md:col-span-1">
                <Label>Seção</Label>
                <Select
                  value={secaoSelecionada || versaoEmEdicao.schema.secoes[0]?.id || ''}
                  onValueChange={(valor) => adicionarCampoForm.setValue('secaoId', valor ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(val: string | null) => {
                        const secao = versaoEmEdicao.schema.secoes.find((s) => s.id === val)
                        return secao?.titulo ?? 'Selecione a seção'
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {versaoEmEdicao.schema.secoes.map((secao) => (
                      <SelectItem key={secao.id} value={secao.id} label={secao.titulo}>
                        {secao.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="campo-placeholder">Placeholder</Label>
              <Input id="campo-placeholder" {...adicionarCampoForm.register('placeholder')} />
            </div>
            {tipoCampoSelecionado === 'numero' ? (
              <div className="space-y-2 md:col-span-1">
                <Label>Máscara</Label>
                <Select
                  value={mascaraSelecionada || ''}
                  onValueChange={(valor) => adicionarCampoForm.setValue('mascara', valor ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(val: string | null) => {
                        return (val && OPCOES_MASCARA_NUMERICA[val]) ? OPCOES_MASCARA_NUMERICA[val] : 'Nenhuma'
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPCOES_MASCARA_NUMERICA).map(([valor, rotulo]) => (
                      <SelectItem key={valor} value={valor} label={rotulo}>{rotulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="campo-descricao">Descrição</Label>
              <Textarea id="campo-descricao" {...adicionarCampoForm.register('descricao')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="campo-opcoes">Opções</Label>
              <Textarea
                id="campo-opcoes"
                placeholder="Uma opção por linha para select ou radio"
                {...adicionarCampoForm.register('opcoesTexto')}
              />
            </div>
            {camposNumeroExistentes.length > 0 ? (
              <div className="space-y-3 rounded-md border border-slate-200 dark:border-slate-700 p-3 md:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Repetição condicional</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Repetir este campo N vezes com base no valor de um campo numérico.</p>
                <div className="space-y-2">
                  <Label>Campo de dependência</Label>
                  <Select
                    value={repeticaoCampoDep || ''}
                    onValueChange={(valor) => adicionarCampoForm.setValue('repeticaoCampoDependencia', valor === '__nenhum__' ? '' : (valor ?? ''))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(val: string | null) => {
                          if (!val || val === '__nenhum__') return 'Nenhum (sem repetição)'
                          const c = camposNumeroExistentes.find((f) => f.chave === val)
                          return c ? c.rotulo : val
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__nenhum__" label="Nenhum (sem repetição)">Nenhum (sem repetição)</SelectItem>
                      {camposNumeroExistentes.map((c) => (
                        <SelectItem key={c.id} value={c.chave} label={c.rotulo}>{c.rotulo} ({c.chave})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {repeticaoCampoDep ? (
                  <div className="space-y-2">
                    <Label htmlFor="campo-limite-max">Limite máximo de repetições</Label>
                    <Input id="campo-limite-max" type="number" min={1} max={50} {...adicionarCampoForm.register('repeticaoLimiteMaximo')} placeholder="20" />
                  </div>
                ) : null}
              </div>
            ) : null}
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 md:col-span-2 dark:text-slate-300">
              <input type="checkbox" {...adicionarCampoForm.register('obrigatorio')} />
              Campo obrigatório
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 md:col-span-2 dark:text-slate-300">
              <input type="checkbox" {...adicionarCampoForm.register('valorUnico')} />
              Valor único (não permite duplicatas neste formulário)
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button
                disabled={!versaoEmEdicao || versaoEmEdicao.statusPublicacao !== 'rascunho' || adicionarCampoMutation.isPending}
                type="submit"
              >
                {adicionarCampoMutation.isPending ? 'Adicionando...' : 'Adicionar campo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      ) : null}

      {/* Seções com campos */}
      {secoesOrdenadas.map((secao) => {
        const ehRascunho = versaoEmEdicao?.statusPublicacao === 'rascunho'
        return (
          <div key={secao.id} className="rounded-lg border border-slate-200 bg-white/95 anim-fade-up dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2 dark:border-[#243047]">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 truncate dark:text-slate-200">{secao.titulo}</h3>
                {secao.descricao ? (
                  <span className="text-xs text-slate-500 truncate hidden sm:inline">— {secao.descricao}</span>
                ) : null}
              </div>
              {ehRascunho ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="icon-sm" variant="ghost" type="button" aria-label="Ações da seção">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        editarSecaoForm.reset({ titulo: secao.titulo, descricao: secao.descricao ?? '' })
                        setDialogEditarSecaoAberto(secao)
                      }}
                    >
                      Editar seção
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmacaoRemoverSecao(secao)}
                    >
                      Remover seção
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
            <div className="divide-y divide-slate-100 anim-stagger dark:divide-[#243047]">
              {secao.campos.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">Nenhum campo nesta seção.</p>
              ) : null}
              {[...secao.campos].sort((a, b) => a.ordem - b.ordem).map((campo: CampoFormularioSchema) => (
                <div key={campo.id} className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#182235]">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate dark:text-slate-100">{campo.rotulo}</span>
                    <Badge variant="outline" className="text-[11px] shrink-0">{campo.tipo}</Badge>
                    {campo.obrigatorio ? <Badge className="text-[11px] shrink-0">Obrigatório</Badge> : null}
                    <span className="text-xs text-slate-400 truncate hidden lg:inline">{campo.chave}</span>
                  </div>
                  {ehRascunho ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button size="icon-sm" variant="ghost" type="button" aria-label="Ações do campo">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDialogEditarCampoAberto({ secao, campo })}>
                          Editar campo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setConfirmacaoRemoverCampo({ secao, campo })}
                        >
                          Remover campo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
