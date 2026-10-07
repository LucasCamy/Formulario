import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CampoFormularioSchema, RegraRepeticaoSchema, SecaoFormularioSchema } from '@/features/formularios/tipos'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { OPCOES_MASCARA_NUMERICA } from './PainelContext'

const schemaEditarCampo = z.object({
  secaoId: z.string(),
  rotulo: z.string().min(2),
  descricao: z.string().optional(),
  placeholder: z.string().optional(),
  mascara: z.string().optional(),
  obrigatorio: z.boolean().default(false),
  valorUnico: z.boolean().default(false),
  opcoesTexto: z.string().optional(),
  repeticaoCampoDependencia: z.string().optional(),
  repeticaoLimiteMaximo: z.coerce.number().int().min(1).max(50).optional(),
})

type EditarCampoFormType = z.input<typeof schemaEditarCampo>

export function EditarCampoFormInline({
  campo,
  secoes,
  secaoAtualId,
  isPending,
  erroServidor,
  onSubmit,
}: {
  campo: CampoFormularioSchema
  secoes: SecaoFormularioSchema[]
  secaoAtualId: string
  isPending: boolean
  erroServidor?: string | null
  onSubmit: (dados: { secaoId: string; rotulo: string; descricao?: string; placeholder?: string; mascara?: string; obrigatorio: boolean; valorUnico: boolean; opcoes?: { rotulo: string; valor: string }[]; repeticao?: RegraRepeticaoSchema | null }) => Promise<void>
}) {
  const form = useForm<EditarCampoFormType>({
    resolver: zodResolver(schemaEditarCampo),
    defaultValues: {
      secaoId: secaoAtualId,
      rotulo: campo.rotulo,
      descricao: campo.descricao ?? '',
      placeholder: campo.placeholder ?? '',
      mascara: campo.mascara ?? '',
      obrigatorio: campo.obrigatorio,
      valorUnico: campo.valorUnico ?? false,
      opcoesTexto: campo.opcoes?.map((o) => o.valor).join('\n') ?? '',
      repeticaoCampoDependencia: campo.repeticao?.campoDependencia ?? '',
      repeticaoLimiteMaximo: campo.repeticao?.limiteMaximo ?? undefined,
    },
  })

  const mascaraSelecionada = useWatch({ control: form.control, name: 'mascara' })
  const secaoIdSelecionada = useWatch({ control: form.control, name: 'secaoId' })
  const repeticaoDep = useWatch({ control: form.control, name: 'repeticaoCampoDependencia' })

  const camposNumero = secoes.flatMap((s) => s.campos).filter((c) => c.tipo === 'numero' && c.id !== campo.id)

  return (
    <form
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      onSubmit={form.handleSubmit(async (dados) => {
        const opcoes = dados.opcoesTexto
          ?.split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((v) => ({ rotulo: v, valor: v }))

        const repeticao = dados.repeticaoCampoDependencia
          ? { campoDependencia: dados.repeticaoCampoDependencia, limiteMaximo: Number(dados.repeticaoLimiteMaximo) || 20 }
          : null

        await onSubmit({
          secaoId: dados.secaoId,
          rotulo: dados.rotulo,
          descricao: dados.descricao,
          placeholder: dados.placeholder,
          mascara: dados.mascara,
          obrigatorio: dados.obrigatorio ?? false,
          valorUnico: dados.valorUnico ?? false,
          opcoes,
          repeticao,
        })
      })}
    >
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-1">
        {erroServidor ? (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{erroServidor}</p>
          </div>
        ) : null}
      {secoes.length > 1 ? (
        <div className="space-y-2">
          <Label>Seção</Label>
          <Select
            value={secaoIdSelecionada}
            onValueChange={(valor) => form.setValue('secaoId', valor ?? secaoAtualId)}
          >
            <SelectTrigger>
              <SelectValue>
                {(val: string | null) => secoes.find((s) => s.id === val)?.titulo ?? 'Selecione a seção'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {secoes.map((secao) => (
                <SelectItem key={secao.id} value={secao.id} label={secao.titulo}>{secao.titulo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="editar-campo-rotulo">Rótulo</Label>
        <Input id="editar-campo-rotulo" {...form.register('rotulo')} />
        {form.formState.errors.rotulo ? (
          <p className="text-sm text-rose-600">{form.formState.errors.rotulo.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="editar-campo-descricao">Descrição</Label>
        <Textarea id="editar-campo-descricao" {...form.register('descricao')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editar-campo-placeholder">Placeholder</Label>
        <Input id="editar-campo-placeholder" {...form.register('placeholder')} />
      </div>
      {campo.tipo === 'numero' ? (
        <div className="space-y-2">
          <Label>Máscara</Label>
          <Select
            value={mascaraSelecionada || ''}
            onValueChange={(valor) => form.setValue('mascara', valor == null || valor === 'nenhuma' ? '' : valor)}
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
      {(campo.tipo === 'selecao' || campo.tipo === 'radio') ? (
        <div className="space-y-2">
          <Label htmlFor="editar-campo-opcoes">Opções</Label>
          <Textarea
            id="editar-campo-opcoes"
            placeholder="Uma opção por linha"
            {...form.register('opcoesTexto')}
          />
        </div>
      ) : null}
      {camposNumero.length > 0 ? (
        <div className="space-y-3 rounded-md border border-slate-200 dark:border-slate-700 p-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Repetição condicional</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Repetir este campo N vezes com base no valor de um campo numérico.</p>
          <div className="space-y-2">
            <Label>Campo de dependência</Label>
            <Select
              value={repeticaoDep || ''}
              onValueChange={(valor) => form.setValue('repeticaoCampoDependencia', valor === '__nenhum__' ? '' : (valor ?? ''))}
            >
              <SelectTrigger>
                <SelectValue>
                  {(val: string | null) => {
                    if (!val || val === '__nenhum__') return 'Nenhum (sem repetição)'
                    const c = camposNumero.find((f) => f.chave === val)
                    return c ? c.rotulo : val
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__" label="Nenhum (sem repetição)">Nenhum (sem repetição)</SelectItem>
                {camposNumero.map((c) => (
                  <SelectItem key={c.id} value={c.chave} label={c.rotulo}>{c.rotulo} ({c.chave})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {repeticaoDep ? (
            <div className="space-y-2">
              <Label htmlFor="editar-campo-limite-max">Limite máximo de repetições</Label>
              <Input id="editar-campo-limite-max" type="number" min={1} max={50} {...form.register('repeticaoLimiteMaximo')} placeholder="20" />
            </div>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        <input type="checkbox" {...form.register('obrigatorio')} />
        Campo obrigatório
      </label>
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        <input type="checkbox" {...form.register('valorUnico')} />
        Valor único (não permite duplicatas neste formulário)
      </label>
      </div>
      <div className="mt-3 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-700">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
