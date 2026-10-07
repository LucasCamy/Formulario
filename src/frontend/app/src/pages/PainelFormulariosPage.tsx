import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/features/auth/store'
import {
  adicionarCampo,
  adicionarSecao,
  arquivarFormulario,
  ativarFormulario,
  criarFormulario,
  criarVersaoRascunho,
  desativarFormulario,
  editarCampo,
  editarFormulario,
  editarSecao,
  excluirFormulario,
  listarFormularios,
  obterBuilderFormulario,
  publicarVersao,
  removerCampo,
  removerSecao,
  removerVersao,
  reordenarCampos,
  reordenarSecoes,
} from '@/features/formularios/api'
import { BuilderTab } from '@/features/formularios/componentes/painel/BuilderTab'
import { DialogsFormulario } from '@/features/formularios/componentes/painel/DialogsFormulario'
import { FormularioBuilderHeader } from '@/features/formularios/componentes/painel/FormularioBuilderHeader'
import {
  PainelContext,
  schemaAdicionarCampo,
  schemaAdicionarSecao,
  schemaCriarFormulario,
  schemaEditarFormulario,
  type CampoForm,
  type EditarFormularioFormType,
  type FormularioForm,
  type SecaoForm,
} from '@/features/formularios/componentes/painel/PainelContext'
import { PreviewTab } from '@/features/formularios/componentes/painel/PreviewTab'
import { SidebarFormularios } from '@/features/formularios/componentes/painel/SidebarFormularios'
import type { PresetSecao } from '@/features/formularios/presetsSecao'
import { useBuilderFormularioStore } from '@/features/formularios/store'
import type { CampoFormularioSchema, SecaoFormularioSchema, VersaoFormularioResumoDto } from '@/features/formularios/tipos'
import { obterMensagemErroApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

export function PainelFormulariosPage() {
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false)
  const [dialogEditarFormularioAberto, setDialogEditarFormularioAberto] = useState(false)
  const [dialogEditarSecaoAberto, setDialogEditarSecaoAberto] = useState<SecaoFormularioSchema | null>(null)
  const [dialogEditarCampoAberto, setDialogEditarCampoAberto] = useState<{ secao: SecaoFormularioSchema; campo: CampoFormularioSchema } | null>(null)
  const [confirmacaoExcluirFormulario, setConfirmacaoExcluirFormulario] = useState(false)
  const [confirmacaoArquivar, setConfirmacaoArquivar] = useState(false)
  const [confirmacaoDesativar, setConfirmacaoDesativar] = useState(false)
  const [confirmacaoPublicar, setConfirmacaoPublicar] = useState(false)
  const [confirmacaoRemoverSecao, setConfirmacaoRemoverSecao] = useState<SecaoFormularioSchema | null>(null)
  const [confirmacaoRemoverCampo, setConfirmacaoRemoverCampo] = useState<{ secao: SecaoFormularioSchema; campo: CampoFormularioSchema } | null>(null)
  const [confirmacaoRemoverVersao, setConfirmacaoRemoverVersao] = useState<VersaoFormularioResumoDto | null>(null)
  const [confirmacaoPreset, setConfirmacaoPreset] = useState<PresetSecao | null>(null)

  const buscaDiferida = useDeferredValue(busca)
  const autorPadrao = useAuthStore((s) => s.usuario?.nome ?? 'operador')
  const { formularioSelecionadoId, versaoEmEdicaoId, setFormularioSelecionado, setVersaoEmEdicao } = useBuilderFormularioStore()

  const formulariosQuery = useQuery({ queryKey: ['formularios'], queryFn: listarFormularios })

  useEffect(() => {
    if (!formularioSelecionadoId && formulariosQuery.data?.[0]?.id) {
      setFormularioSelecionado(formulariosQuery.data[0].id)
    }
  }, [formulariosQuery.data, formularioSelecionadoId, setFormularioSelecionado])

  const builderQuery = useQuery({
    queryKey: ['builder-formulario', formularioSelecionadoId],
    enabled: Boolean(formularioSelecionadoId),
    queryFn: () => obterBuilderFormulario(formularioSelecionadoId!),
  })

  useEffect(() => {
    if (!builderQuery.data) return
    const versoes = builderQuery.data.formulario.versoes
    if (versaoEmEdicaoId && versoes.some((v) => v.id === versaoEmEdicaoId)) return
    const rascunho = versoes.find((v) => v.statusPublicacao === 'rascunho')
    const alvo = rascunho ?? versoes[0]
    if (alvo) setVersaoEmEdicao(alvo.id)
  }, [builderQuery.data, versaoEmEdicaoId, setVersaoEmEdicao])

  const formulariosFiltrados = useMemo(() => {
    const termo = buscaDiferida.trim().toLowerCase()
    return (formulariosQuery.data ?? []).filter((f) =>
      !termo || f.titulo.toLowerCase().includes(termo) || f.chave.toLowerCase().includes(termo)
    )
  }, [buscaDiferida, formulariosQuery.data])

  const versaoEmEdicao =
    builderQuery.data?.formulario.versoes.find((v) => v.id === versaoEmEdicaoId) ??
    builderQuery.data?.versaoEmEdicao ??
    undefined

  const criarFormularioForm = useForm<FormularioForm>({ resolver: zodResolver(schemaCriarFormulario), defaultValues: { titulo: '', descricao: '', chave: '' } })
  const adicionarCampoForm = useForm<CampoForm>({
    resolver: zodResolver(schemaAdicionarCampo),
    defaultValues: { chave: '', rotulo: '', descricao: '', tipo: 'textoCurto', placeholder: '', mascara: '', obrigatorio: false, opcoesTexto: '', secaoId: '' },
  })
  const adicionarSecaoForm = useForm<SecaoForm>({ resolver: zodResolver(schemaAdicionarSecao), defaultValues: { titulo: '', descricao: '' } })
  const editarFormularioForm = useForm<EditarFormularioFormType>({ resolver: zodResolver(schemaEditarFormulario), defaultValues: { titulo: '', descricao: '' } })
  const editarSecaoForm = useForm<SecaoForm>({ resolver: zodResolver(schemaAdicionarSecao), defaultValues: { titulo: '', descricao: '' } })

  const tipoCampoSelecionado = useWatch({ control: adicionarCampoForm.control, name: 'tipo' })
  const secaoSelecionada = useWatch({ control: adicionarCampoForm.control, name: 'secaoId' })
  const mascaraSelecionada = useWatch({ control: adicionarCampoForm.control, name: 'mascara' })

  const invalidarConsultas = async () => {
    await queryClient.invalidateQueries({ queryKey: ['formularios'] })
    await queryClient.invalidateQueries({ queryKey: ['builder-formulario', formularioSelecionadoId] })
    await queryClient.invalidateQueries({ queryKey: ['formulario-publicado', formularioSelecionadoId] })
  }

  const criarFormularioMutation = useMutation({
    mutationFn: criarFormulario,
    onSuccess: async (formulario) => {
      setDialogCriarAberto(false)
      criarFormularioForm.reset()
      setFormularioSelecionado(formulario.id)
      await invalidarConsultas()
      toast.success('Formulário criado com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao criar formulário.')),
  })

  const criarVersaoMutation = useMutation({
    mutationFn: async () => criarVersaoRascunho(formularioSelecionadoId!, autorPadrao),
    onSuccess: async (versao) => {
      setVersaoEmEdicao(versao.id)
      await invalidarConsultas()
      toast.success('Nova versão em rascunho criada.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao criar versão.')),
  })

  const adicionarSecaoMutation = useMutation({
    mutationFn: async (dados: SecaoForm) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Selecione um formulario e crie uma versao em rascunho.')
      return adicionarSecao(formularioSelecionadoId, versaoEmEdicao.id, dados.titulo, dados.descricao, autorPadrao)
    },
    onSuccess: async () => {
      adicionarSecaoForm.reset()
      await invalidarConsultas()
      toast.success('Seção adicionada com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao adicionar seção.')),
  })

  const adicionarCampoMutation = useMutation({
    mutationFn: async (dados: CampoForm) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Selecione um formulario e crie uma versao em rascunho antes de adicionar campos.')
      const opcoes = dados.opcoesTexto?.split('\n').map((l) => l.trim()).filter(Boolean).map((v) => ({ rotulo: v, valor: v }))
      const secaoAlvo = dados.secaoId || versaoEmEdicao.schema.secoes[0]?.id
      const secao = versaoEmEdicao.schema.secoes.find((s) => s.id === secaoAlvo)
      const repeticao = dados.repeticaoCampoDependencia
        ? { campoDependencia: dados.repeticaoCampoDependencia, limiteMaximo: Number(dados.repeticaoLimiteMaximo) || 20 }
        : undefined
      return adicionarCampo(formularioSelecionadoId, versaoEmEdicao.id, {
        secaoId: secaoAlvo, chave: dados.chave, rotulo: dados.rotulo, descricao: dados.descricao,
        tipo: dados.tipo, obrigatorio: dados.obrigatorio ?? false, valorUnico: dados.valorUnico ?? false,
        placeholder: dados.placeholder,
        mascara: dados.mascara, ordem: (secao?.campos.length ?? 0) + 1, opcoes, repeticao, alteradoPor: autorPadrao,
      })
    },
    onSuccess: async () => {
      adicionarCampoForm.reset({ chave: '', rotulo: '', descricao: '', tipo: 'textoCurto', placeholder: '', mascara: '', obrigatorio: false, valorUnico: false, opcoesTexto: '', secaoId: '', repeticaoCampoDependencia: '', repeticaoLimiteMaximo: undefined })
      await invalidarConsultas()
      toast.success('Campo adicionado com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao adicionar campo.')),
  })

  const publicarVersaoMutation = useMutation({
    mutationFn: async () => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Nao ha versao em edicao para publicar.')
      return publicarVersao(formularioSelecionadoId, versaoEmEdicao.id, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoPublicar(false)
      await invalidarConsultas()
      toast.success('Versão publicada com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao publicar versão.')),
  })

  const arquivarFormularioMutation = useMutation({
    mutationFn: async () => {
      if (!formularioSelecionadoId) throw new Error('Selecione um formulario para arquivar.')
      return arquivarFormulario(formularioSelecionadoId, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoArquivar(false)
      await invalidarConsultas()
      toast.success('Formulário arquivado.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao arquivar formulário.')),
  })

  const desativarFormularioMutation = useMutation({
    mutationFn: async () => {
      if (!formularioSelecionadoId) throw new Error('Nenhum formulario selecionado.')
      return desativarFormulario(formularioSelecionadoId, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoDesativar(false)
      await invalidarConsultas()
      toast.success('Formulário desativado. O link público não estará mais disponível.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao desativar formulário.')),
  })

  const ativarFormularioMutation = useMutation({
    mutationFn: async () => {
      if (!formularioSelecionadoId) throw new Error('Nenhum formulario selecionado.')
      return ativarFormulario(formularioSelecionadoId, autorPadrao)
    },
    onSuccess: async () => {
      await invalidarConsultas()
      toast.success('Formulário ativado. O link público está disponível novamente.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao ativar formulário.')),
  })

  const editarFormularioMutation = useMutation({
    mutationFn: async (dados: EditarFormularioFormType) => {
      if (!formularioSelecionadoId) throw new Error('Nenhum formulario selecionado.')
      return editarFormulario(formularioSelecionadoId, dados.titulo, dados.descricao, autorPadrao)
    },
    onSuccess: async () => {
      setDialogEditarFormularioAberto(false)
      editarFormularioForm.reset()
      await invalidarConsultas()
      toast.success('Formulário editado com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao editar formulário.')),
  })

  const excluirFormularioMutation = useMutation({
    mutationFn: async () => {
      if (!formularioSelecionadoId) throw new Error('Nenhum formulario selecionado.')
      return excluirFormulario(formularioSelecionadoId, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoExcluirFormulario(false)
      setFormularioSelecionado(undefined as unknown as string)
      await invalidarConsultas()
      toast.success('Formulário excluído com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Não foi possível excluir. Verifique se não há versão publicada.')),
  })

  const editarSecaoMutation = useMutation({
    mutationFn: async (dados: { secaoId: string } & SecaoForm) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Sem versao em edicao.')
      return editarSecao(formularioSelecionadoId, versaoEmEdicao.id, dados.secaoId, dados.titulo, dados.descricao, autorPadrao)
    },
    onSuccess: async () => {
      setDialogEditarSecaoAberto(null)
      editarSecaoForm.reset()
      await invalidarConsultas()
      toast.success('Seção editada com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao editar seção.')),
  })

  const removerSecaoMutation = useMutation({
    mutationFn: async (secaoId: string) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Sem versao em edicao.')
      return removerSecao(formularioSelecionadoId, versaoEmEdicao.id, secaoId, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoRemoverSecao(null)
      await invalidarConsultas()
      toast.success('Seção removida com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Não foi possível remover. A versão deve conter pelo menos uma seção.')),
  })

  const editarCampoMutation = useMutation({
    mutationFn: async (dados: { secaoId: string; campoId: string; rotulo: string; descricao?: string; placeholder?: string; mascara?: string; obrigatorio: boolean; valorUnico?: boolean; opcoes?: { rotulo: string; valor: string }[]; repeticao?: { campoDependencia: string; limiteMaximo?: number } | null }) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Sem versao em edicao.')
      return editarCampo(formularioSelecionadoId, versaoEmEdicao.id, dados.secaoId, dados.campoId, {
        rotulo: dados.rotulo, descricao: dados.descricao, placeholder: dados.placeholder,
        mascara: dados.mascara, obrigatorio: dados.obrigatorio, valorUnico: dados.valorUnico, opcoes: dados.opcoes, repeticao: dados.repeticao, alteradoPor: autorPadrao,
      })
    },
    onSuccess: async () => {
      setDialogEditarCampoAberto(null)
      await invalidarConsultas()
      toast.success('Campo editado com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao editar campo.')),
  })

  const removerCampoMutation = useMutation({
    mutationFn: async (dados: { secaoId: string; campoId: string }) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Sem versao em edicao.')
      return removerCampo(formularioSelecionadoId, versaoEmEdicao.id, dados.secaoId, dados.campoId, autorPadrao)
    },
    onSuccess: async () => {
      setConfirmacaoRemoverCampo(null)
      await invalidarConsultas()
      toast.success('Campo removido com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao remover campo.')),
  })

  const removerVersaoMutation = useMutation({
    mutationFn: async (versaoId: string) => {
      if (!formularioSelecionadoId) throw new Error('Nenhum formulario selecionado.')
      return removerVersao(formularioSelecionadoId, versaoId, autorPadrao)
    },
    onSuccess: async (_, versaoId) => {
      setConfirmacaoRemoverVersao(null)
      if (versaoEmEdicaoId === versaoId) setVersaoEmEdicao(undefined)
      await invalidarConsultas()
      toast.success('Versão removida com sucesso.')
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Não foi possível remover a versão. Apenas rascunhos podem ser removidos.')),
  })

  const reordenarCamposMutation = useMutation({
    mutationFn: async (dados: { secaoId: string; campos: { campoId: string; ordem: number; larguraColunas: number }[] }) => {
      if (!formularioSelecionadoId || !versaoEmEdicaoId) throw new Error('Sem versao em edicao.')
      return reordenarCampos(formularioSelecionadoId, versaoEmEdicaoId, dados.secaoId, dados.campos, autorPadrao)
    },
    onMutate: () => {
      toast.loading('Salvando layout...', { id: 'salvar-layout-campos' })
    },
    onSuccess: async () => {
      await invalidarConsultas()
      toast.success('Layout salvo com sucesso.', { id: 'salvar-layout-campos' })
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao reordenar campos.'), { id: 'salvar-layout-campos' }),
  })

  const reordenarSecoesMutation = useMutation({
    mutationFn: async (dados: { secoes: { secaoId: string; ordem: number }[] }) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Sem versao em edicao.')
      return reordenarSecoes(formularioSelecionadoId, versaoEmEdicao.id, dados.secoes, autorPadrao)
    },
    onMutate: () => {
      toast.loading('Salvando ordem das seções...', { id: 'salvar-ordem-secoes' })
    },
    onSuccess: async () => {
      await invalidarConsultas()
      toast.success('Ordem das seções salva com sucesso.', { id: 'salvar-ordem-secoes' })
    },
    onError: (err) => toast.error(obterMensagemErroApi(err, 'Erro ao reordenar seções.'), { id: 'salvar-ordem-secoes' }),
  })

  const aplicarPresetMutation = useMutation({
    mutationFn: async (preset: PresetSecao) => {
      if (!formularioSelecionadoId || !versaoEmEdicao?.id) throw new Error('Selecione um formulário e crie uma versão em rascunho.')

      // 1. Criar a seção
      let versaoAtualizada = await adicionarSecao(
        formularioSelecionadoId, versaoEmEdicao.id, preset.titulo, preset.descricao, autorPadrao,
      )

      // 2. Encontrar a seção recém-criada (última com o título do preset)
      const novaSecao = [...versaoAtualizada.schema.secoes]
        .reverse()
        .find((s) => s.titulo === preset.titulo)
      if (!novaSecao) throw new Error('Não foi possível localizar a seção criada.')

      // 3. Adicionar campos sequencialmente
      for (let i = 0; i < preset.campos.length; i++) {
        const campoPreset = preset.campos[i]
        versaoAtualizada = await adicionarCampo(formularioSelecionadoId, versaoEmEdicao.id, {
          secaoId: novaSecao.id,
          chave: campoPreset.chave,
          rotulo: campoPreset.rotulo,
          descricao: campoPreset.descricao,
          tipo: campoPreset.tipo,
          obrigatorio: campoPreset.obrigatorio,
          placeholder: campoPreset.placeholder,
          mascara: campoPreset.mascara,
          ordem: i + 1,
          opcoes: campoPreset.opcoes,
          validacoes: campoPreset.validacoes,
          alteradoPor: autorPadrao,
        })
      }

      // 4. Aplicar larguraColunas via reordenar
      const secaoFinal = versaoAtualizada.schema.secoes.find((s) => s.id === novaSecao.id)
      if (secaoFinal && secaoFinal.campos.length > 0) {
        const camposReordenados = secaoFinal.campos.map((campo) => {
          const presetCampo = preset.campos.find((p) => p.chave === campo.chave)
          return {
            campoId: campo.id,
            ordem: campo.ordem,
            larguraColunas: presetCampo?.larguraColunas ?? 12,
          }
        })
        await reordenarCampos(formularioSelecionadoId, versaoEmEdicao.id, novaSecao.id, camposReordenados, autorPadrao)
      }

      return versaoAtualizada
    },
    onSuccess: async () => {
      await invalidarConsultas()
      toast.success('Seção pré-configurada aplicada com sucesso.')
    },
    onError: (err) => toast.error(`Erro ao aplicar preset: ${err instanceof Error ? err.message : 'erro desconhecido'}`),
  })

  return (
    <PainelContext.Provider value={{
      formulariosIsLoading: formulariosQuery.isLoading,
      formulariosTotal: formulariosQuery.data?.length ?? 0,
      builderData: builderQuery.data,
      builderIsLoading: builderQuery.isLoading,
      formulariosFiltrados,
      versaoEmEdicao,
      formularioSelecionadoId,
      versaoEmEdicaoId,
      setFormularioSelecionado,
      setVersaoEmEdicao,
      busca,
      setBusca,
      dialogCriarAberto,
      setDialogCriarAberto,
      dialogEditarFormularioAberto,
      setDialogEditarFormularioAberto,
      dialogEditarSecaoAberto,
      setDialogEditarSecaoAberto,
      dialogEditarCampoAberto,
      setDialogEditarCampoAberto,
      confirmacaoExcluirFormulario,
      setConfirmacaoExcluirFormulario,
      confirmacaoArquivar,
      setConfirmacaoArquivar,
      confirmacaoDesativar,
      setConfirmacaoDesativar,
      confirmacaoPublicar,
      setConfirmacaoPublicar,
      confirmacaoRemoverSecao,
      setConfirmacaoRemoverSecao,
      confirmacaoRemoverCampo,
      setConfirmacaoRemoverCampo,
      confirmacaoRemoverVersao,
      setConfirmacaoRemoverVersao,
      confirmacaoPreset,
      setConfirmacaoPreset,
      criarFormularioForm,
      adicionarCampoForm,
      adicionarSecaoForm,
      editarFormularioForm,
      editarSecaoForm,
      tipoCampoSelecionado,
      secaoSelecionada,
      mascaraSelecionada,
      autorPadrao,
      criarFormularioMutation,
      criarVersaoMutation,
      adicionarSecaoMutation,
      adicionarCampoMutation,
      publicarVersaoMutation,
      arquivarFormularioMutation,
      desativarFormularioMutation,
      ativarFormularioMutation,
      editarFormularioMutation,
      excluirFormularioMutation,
      editarSecaoMutation,
      removerSecaoMutation,
      editarCampoMutation,
      removerCampoMutation,
      removerVersaoMutation,
      aplicarPresetMutation,
      reordenarSecoesMutation,
      onReordenarCampos: reordenarCamposMutation.mutate,
      reordenarIsPending: reordenarCamposMutation.isPending,
    }}>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SidebarFormularios />

        <section className="min-w-0 space-y-6">
          {builderQuery.isLoading ? (
            <Card className="anim-fade-in">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : null}

          {!builderQuery.isLoading && !builderQuery.data ? (
            <Card className="border-dashed border-slate-300 bg-white/80 anim-fade-up dark:border-slate-600 dark:bg-slate-900/80">
              <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                Selecione um formulário para abrir o builder.
              </CardContent>
            </Card>
          ) : null}

          {builderQuery.data ? (
            <>
              <FormularioBuilderHeader />
              <Tabs className="space-y-4" defaultValue="builder">
                <TabsList className="bg-white dark:bg-slate-800">
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="preview">Preview do schema</TabsTrigger>
                </TabsList>
                <TabsContent value="builder" className="space-y-4">
                  <BuilderTab />
                </TabsContent>
                <TabsContent value="preview" className="space-y-4">
                  <PreviewTab />
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </section>

        <DialogsFormulario />
      </div>
    </PainelContext.Provider>
  )
}
