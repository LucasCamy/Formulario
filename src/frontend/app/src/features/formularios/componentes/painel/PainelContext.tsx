import type { PresetSecao } from '@/features/formularios/presetsSecao'
import type {
    BuilderFormularioDto,
    CampoFormularioSchema,
    FormularioResumoDto,
    SecaoFormularioSchema,
    TipoCampo,
    VersaoFormularioResumoDto,
} from '@/features/formularios/tipos'
import { createContext, useContext } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const schemaCriarFormulario = z.object({
  titulo: z.string().min(3, 'Informe um título com pelo menos 3 caracteres.'),
  descricao: z.string().optional(),
  chave: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Use apenas minúsculas, números e hífen.'),
})

export const schemaAdicionarCampo = z.object({
  chave: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Use apenas minúsculas, números e hífen.'),
  rotulo: z.string().min(2),
  descricao: z.string().optional(),
  tipo: z.enum(['textoCurto', 'textoLongo', 'numero', 'email', 'data', 'selecao', 'radio', 'caixaMarcacao']),
  placeholder: z.string().optional(),
  mascara: z.string().optional(),
  obrigatorio: z.boolean().default(false),
  valorUnico: z.boolean().default(false),
  opcoesTexto: z.string().optional(),
  secaoId: z.string().optional(),
  repeticaoCampoDependencia: z.string().optional(),
  repeticaoLimiteMaximo: z.coerce.number().int().min(1).max(50).optional(),
})

export const schemaAdicionarSecao = z.object({
  titulo: z.string().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  descricao: z.string().optional(),
})

export const schemaEditarFormulario = z.object({
  titulo: z.string().min(3, 'Informe um título com pelo menos 3 caracteres.'),
  descricao: z.string().optional(),
})

export type FormularioForm = z.input<typeof schemaCriarFormulario>
export type CampoForm = z.input<typeof schemaAdicionarCampo>
export type SecaoForm = z.input<typeof schemaAdicionarSecao>
export type EditarFormularioFormType = z.input<typeof schemaEditarFormulario>

// ─── Constants ────────────────────────────────────────────────────────────────

export const OPCOES_MASCARA_NUMERICA: Record<string, string> = {
  nenhuma: 'Nenhuma',
  dinheiro: 'Dinheiro (R$ 0,00)',
  cpf: 'CPF (000.000.000-00)',
  cnpj: 'CNPJ (00.000.000/0000-00)',
  telefone: 'Telefone ((00) 00000-0000)',
  cep: 'CEP (00000-000)',
}

export function gerarRotuloStatus(status: string) {
  switch (status) {
    case 'publicada': return 'Publicada'
    case 'arquivada': return 'Arquivada'
    default: return 'Rascunho'
  }
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export type DialogEditarCampoState = { secao: SecaoFormularioSchema; campo: CampoFormularioSchema }

export type EditarCampoMutacaoArgs = {
  secaoId: string
  campoId: string
  rotulo: string
  descricao?: string
  placeholder?: string
  mascara?: string
  obrigatorio: boolean
  valorUnico?: boolean
  opcoes?: { rotulo: string; valor: string }[]
  repeticao?: { campoDependencia: string; limiteMaximo?: number } | null
}

export type ReordenarCamposArgs = {
  secaoId: string
  campos: { campoId: string; ordem: number; larguraColunas: number }[]
}

// ─── Context type ─────────────────────────────────────────────────────────────

export type PainelContextValue = {
  // Queries
  formulariosIsLoading: boolean
  formulariosTotal: number
  builderData: BuilderFormularioDto | undefined
  builderIsLoading: boolean

  // Computed
  formulariosFiltrados: FormularioResumoDto[]
  versaoEmEdicao: VersaoFormularioResumoDto | undefined

  // Store state
  formularioSelecionadoId: string | undefined
  versaoEmEdicaoId: string | undefined
  setFormularioSelecionado: (id: string) => void
  setVersaoEmEdicao: (id: string | undefined) => void

  // Search
  busca: string
  setBusca: (v: string) => void

  // Dialog states
  dialogCriarAberto: boolean
  setDialogCriarAberto: (v: boolean) => void
  dialogEditarFormularioAberto: boolean
  setDialogEditarFormularioAberto: (v: boolean) => void
  dialogEditarSecaoAberto: SecaoFormularioSchema | null
  setDialogEditarSecaoAberto: (v: SecaoFormularioSchema | null) => void
  dialogEditarCampoAberto: DialogEditarCampoState | null
  setDialogEditarCampoAberto: (v: DialogEditarCampoState | null) => void

  // Confirmation states
  confirmacaoExcluirFormulario: boolean
  setConfirmacaoExcluirFormulario: (v: boolean) => void
  confirmacaoArquivar: boolean
  setConfirmacaoArquivar: (v: boolean) => void
  confirmacaoDesativar: boolean
  setConfirmacaoDesativar: (v: boolean) => void
  confirmacaoPublicar: boolean
  setConfirmacaoPublicar: (v: boolean) => void
  confirmacaoRemoverSecao: SecaoFormularioSchema | null
  setConfirmacaoRemoverSecao: (v: SecaoFormularioSchema | null) => void
  confirmacaoRemoverCampo: DialogEditarCampoState | null
  setConfirmacaoRemoverCampo: (v: DialogEditarCampoState | null) => void
  confirmacaoRemoverVersao: VersaoFormularioResumoDto | null
  setConfirmacaoRemoverVersao: (v: VersaoFormularioResumoDto | null) => void
  confirmacaoPreset: import('@/features/formularios/presetsSecao').PresetSecao | null
  setConfirmacaoPreset: (v: import('@/features/formularios/presetsSecao').PresetSecao | null) => void

  // Forms
  criarFormularioForm: UseFormReturn<FormularioForm>
  adicionarCampoForm: UseFormReturn<CampoForm>
  adicionarSecaoForm: UseFormReturn<SecaoForm>
  editarFormularioForm: UseFormReturn<EditarFormularioFormType>
  editarSecaoForm: UseFormReturn<SecaoForm>

  // useWatch results
  tipoCampoSelecionado: TipoCampo
  secaoSelecionada: string | undefined
  mascaraSelecionada: string | undefined

  // Misc
  autorPadrao: string

  // Mutations
  criarFormularioMutation: { isPending: boolean; mutateAsync: (dados: FormularioForm & { criadoPor: string }) => Promise<unknown> }
  criarVersaoMutation: { isPending: boolean; mutate: () => void }
  adicionarSecaoMutation: { isPending: boolean; mutateAsync: (dados: SecaoForm) => Promise<unknown> }
  adicionarCampoMutation: { isPending: boolean; isError: boolean; error: unknown; mutateAsync: (dados: CampoForm) => Promise<unknown> }
  publicarVersaoMutation: { isPending: boolean; mutate: () => void }
  arquivarFormularioMutation: { isPending: boolean; mutate: () => void }
  desativarFormularioMutation: { isPending: boolean; mutate: () => void }
  ativarFormularioMutation: { isPending: boolean; mutate: () => void }
  editarFormularioMutation: { isPending: boolean; mutateAsync: (dados: EditarFormularioFormType) => Promise<unknown> }
  excluirFormularioMutation: { isPending: boolean; mutate: () => void }
  editarSecaoMutation: { isPending: boolean; mutateAsync: (dados: { secaoId: string } & SecaoForm) => Promise<unknown> }
  removerSecaoMutation: { isPending: boolean; mutate: (secaoId: string) => void }
  editarCampoMutation: { isPending: boolean; isError: boolean; error: unknown; mutateAsync: (dados: EditarCampoMutacaoArgs) => Promise<unknown> }
  removerCampoMutation: { isPending: boolean; mutate: (dados: { secaoId: string; campoId: string }) => void }
  removerVersaoMutation: { isPending: boolean; mutate: (versaoId: string) => void }
  aplicarPresetMutation: { isPending: boolean; mutate: (preset: PresetSecao) => void }
  reordenarSecoesMutation: { isPending: boolean; mutate: (dados: { secoes: { secaoId: string; ordem: number }[] }) => void }
  onReordenarCampos: (dados: ReordenarCamposArgs) => void
  reordenarIsPending: boolean
}

// ─── Context + hook ───────────────────────────────────────────────────────────

export const PainelContext = createContext<PainelContextValue | null>(null)

export function usePainel(): PainelContextValue {
  const ctx = useContext(PainelContext)
  if (!ctx) throw new Error('usePainel deve ser usado dentro de PainelContext.Provider')
  return ctx
}
