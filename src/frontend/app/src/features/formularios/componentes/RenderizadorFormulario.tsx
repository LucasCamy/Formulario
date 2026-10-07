import { HtmlSeguro } from '@/components/HtmlSeguro'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { submeterFormulario } from '@/features/formularios/api'
import type { CampoFormularioSchema, SchemaFormulario, SecaoFormularioSchema, SubmissaoDto } from '@/features/formularios/tipos'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

interface RenderizadorFormularioProps {
  formularioId: string
  schema: SchemaFormulario
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const MASCARAS: Record<string, { formato: (v: string) => string; maxLength: number }> = {
  cpf: {
    formato: (v: string) => {
      const d = v.replace(/\D/g, '').slice(0, 11)
      return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    },
    maxLength: 14,
  },
  cnpj: {
    formato: (v: string) => {
      const d = v.replace(/\D/g, '').slice(0, 14)
      return d
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    },
    maxLength: 18,
  },
  telefone: {
    formato: (v: string) => {
      const d = v.replace(/\D/g, '').slice(0, 11)
      if (d.length <= 10) {
        return d
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
      }
      return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    },
    maxLength: 15,
  },
  cep: {
    formato: (v: string) => {
      const d = v.replace(/\D/g, '').slice(0, 8)
      return d.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
    },
    maxLength: 9,
  },
  dinheiro: {
    formato: (v: string) => {
      const d = v.replace(/\D/g, '')
      if (!d) {
        return ''
      }
      return formatadorMoeda.format(Number(d) / 100)
    },
    maxLength: 18,
  },
}

function converterDinheiroMascaradoParaNumero(valor: unknown) {
  if (typeof valor !== 'string') {
    return null
  }

  const digitos = valor.replace(/\D/g, '')
  if (!digitos) {
    return null
  }

  return Number(digitos) / 100
}

function validarValorMascarado(campo: CampoFormularioSchema, valor: unknown) {
  if (campo.mascara !== 'dinheiro') {
    return true
  }

  const numero = converterDinheiroMascaradoParaNumero(valor)
  if (numero == null) {
    return true
  }

  if (campo.validacoes.valorMinimo != null && numero < campo.validacoes.valorMinimo) {
    return `Valor mínimo ${formatadorMoeda.format(campo.validacoes.valorMinimo)}.`
  }

  if (campo.validacoes.valorMaximo != null && numero > campo.validacoes.valorMaximo) {
    return `Valor máximo ${formatadorMoeda.format(campo.validacoes.valorMaximo)}.`
  }

  return true
}

function obterValorInicial(campo: CampoFormularioSchema) {
  if (campo.tipo === 'caixaMarcacao') {
    return false
  }

  return ''
}

function estaCampoVisivel(campo: CampoFormularioSchema, valores: Record<string, unknown>) {
  if (!campo.visibilidade) {
    return true
  }

  const valorDependencia = valores[campo.visibilidade.campoDependencia]
  const valorAtual = valorDependencia == null ? '' : String(valorDependencia)
  return valorAtual === campo.visibilidade.valorEsperado
}

interface CampoExpandido {
  campo: CampoFormularioSchema
  chaveRenderizada: string
  indiceRepeticao?: number
  totalRepeticoes?: number
}

function expandirCamposComRepeticao(
  campos: CampoFormularioSchema[],
  valores: Record<string, unknown>,
): CampoExpandido[] {
  return campos.flatMap((campo) => {
    if (!campo.repeticao) {
      return [{ campo, chaveRenderizada: campo.chave }]
    }
    const valorDependencia = valores[campo.repeticao.campoDependencia]
    const quantidade = Math.max(0, Math.min(
      Math.floor(Number(valorDependencia) || 0),
      campo.repeticao.limiteMaximo ?? 20,
    ))
    if (quantidade === 0) return []
    return Array.from({ length: quantidade }, (_, i) => ({
      campo,
      chaveRenderizada: `${campo.chave}__${i + 1}`,
      indiceRepeticao: i + 1,
      totalRepeticoes: quantidade,
    }))
  })
}

// ─── CEP Auto-fill via ViaCEP ─────────────────────────────────────────────────

interface ViaCepResposta {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  complemento?: string
  erro?: boolean
}

async function buscarCep(cep: string): Promise<ViaCepResposta | null> {
  const digitos = cep.replace(/\D/g, '')
  if (digitos.length !== 8) return null
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
    if (!resp.ok) return null
    const dados: ViaCepResposta = await resp.json()
    if (dados.erro) return null
    return dados
  } catch {
    return null
  }
}

const MAPA_CAMPOS_CEP: Record<string, keyof ViaCepResposta> = {
  rua: 'logradouro',
  logradouro: 'logradouro',
  bairro: 'bairro',
  cidade: 'localidade',
  localidade: 'localidade',
  uf: 'uf',
  estado: 'uf',
}

function encontrarCamposEndereco(secao: SecaoFormularioSchema) {
  const resultado: { chave: string; propriedadeCep: keyof ViaCepResposta }[] = []
  for (const campo of secao.campos) {
    for (const [padrao, prop] of Object.entries(MAPA_CAMPOS_CEP)) {
      if (campo.chave === padrao || campo.chave.endsWith(`-${padrao}`) || campo.chave.includes(padrao)) {
        resultado.push({ chave: campo.chave, propriedadeCep: prop })
        break
      }
    }
  }
  return resultado
}

function useCepAutoFill(
  schema: SchemaFormulario,
  watch: () => Record<string, unknown>,
  setValue: (name: string, value: unknown) => void,
) {
  const cepAnteriorRef = useRef<Record<string, string>>({})
  const [carregandoCep, setCarregandoCep] = useState<Record<string, boolean>>({})

  const verificarCep = useCallback(async (chaveCep: string, valorCep: string, secao: SecaoFormularioSchema) => {
    const digitos = valorCep.replace(/\D/g, '')
    if (digitos.length !== 8) return
    if (cepAnteriorRef.current[chaveCep] === digitos) return
    cepAnteriorRef.current[chaveCep] = digitos

    setCarregandoCep((prev) => ({ ...prev, [chaveCep]: true }))
    const dados = await buscarCep(digitos)
    setCarregandoCep((prev) => ({ ...prev, [chaveCep]: false }))

    if (!dados) return

    const camposEndereco = encontrarCamposEndereco(secao)
    for (const { chave, propriedadeCep } of camposEndereco) {
      const valor = dados[propriedadeCep]
      if (valor) setValue(chave, valor)
    }
  }, [setValue])

  useEffect(() => {
    const valores = watch()
    for (const secao of schema.secoes) {
      for (const campo of secao.campos) {
        if (campo.mascara !== 'cep') continue
        const valorCep = String(valores[campo.chave] ?? '')
        verificarCep(campo.chave, valorCep, secao)
      }
    }
  })

  return { carregandoCep }
}

export function RenderizadorFormulario({ formularioId, schema }: RenderizadorFormularioProps) {
  const [submissao, setSubmissao] = useState<SubmissaoDto | null>(null)
  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm<Record<string, unknown>>({
    defaultValues: {},
  })

  const valores = watch()
  const { carregandoCep } = useCepAutoFill(schema, watch, setValue)

  useEffect(() => {
    const defaults = Object.fromEntries(
      schema.secoes.flatMap((secao) => secao.campos.map((campo) => [campo.chave, obterValorInicial(campo)])),
    )

    reset(defaults)
  }, [reset, schema])

  const submissaoMutation = useMutation({
    mutationFn: async (dadosResposta: Record<string, unknown>) =>
      submeterFormulario(formularioId, dadosResposta, 'Anônimo'),
    onSuccess: (resposta) => {
      setSubmissao(resposta)
      toast.success('Resposta enviada com sucesso.')
    },
    onError: (erro) => {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao enviar resposta.'
      toast.error(mensagem)
    },
  })

  const onSubmit = handleSubmit(async (dados) => {
    await submissaoMutation.mutateAsync(dados)
  })

  if (submissao) {
    return (
      <Card className="overflow-hidden border-emerald-200 bg-[linear-gradient(180deg,_rgba(236,253,245,0.96),_rgba(255,255,255,0.92))] shadow-[0_18px_50px_rgba(16,185,129,0.10)] dark:border-emerald-800 dark:bg-[linear-gradient(180deg,_rgba(6,78,59,0.4),_rgba(15,23,42,0.92))]">
        <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_45%)]">
          <CardTitle className="text-emerald-950 dark:text-emerald-100">Resposta registrada</CardTitle>
          <CardDescription>
            A submissão foi persistida com sucesso para a versão exata publicada do formulário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p><strong>Submissão:</strong> {submissao.id}</p>
          <p><strong>Status:</strong> {submissao.status}</p>
          <Link to="/" className="text-sm font-medium text-sky-700 underline underline-offset-4">
            Voltar ao painel
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <form className="space-y-8 anim-fade-up" onSubmit={onSubmit}>
      {schema.secoes
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((secao) => (
          <Card key={secao.id} className="overflow-hidden rounded-[1.6rem] border-slate-200/80 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/92">
            <CardHeader className="bg-[linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(240,249,255,0.86))] dark:bg-[linear-gradient(135deg,_rgba(30,41,59,0.92),_rgba(15,23,42,0.86))]">
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50"><HtmlSeguro html={secao.titulo} /></CardTitle>
              {secao.descricao ? <CardDescription className="max-w-2xl text-slate-600 dark:text-slate-400"><HtmlSeguro html={secao.descricao} /></CardDescription> : null}
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="form-campos-grid grid grid-cols-12 gap-x-4 gap-y-6">
              {expandirCamposComRepeticao(
                secao.campos
                  .slice()
                  .sort((a, b) => a.ordem - b.ordem)
                  .filter((campo) => estaCampoVisivel(campo, valores)),
                valores,
              ).map(({ campo, chaveRenderizada, indiceRepeticao }) => {
                  const mensagemErro = errors[chaveRenderizada]?.message
                  const colSpan = campo.larguraColunas ?? 12
                  const rotulo = indiceRepeticao
                    ? `${campo.rotulo} (${indiceRepeticao})`
                    : campo.rotulo

                  if (campo.tipo === 'textoLongo') {
                    return (
                      <div key={chaveRenderizada} className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/55 dark:border-slate-700/70 dark:bg-slate-800/55 p-4" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                        <Label htmlFor={chaveRenderizada}><HtmlSeguro html={rotulo} /></Label>
                        <Textarea
                          id={chaveRenderizada}
                          placeholder={campo.placeholder ?? undefined}
                          {...register(chaveRenderizada, {
                            required: campo.obrigatorio ? 'Campo obrigatório.' : false,
                            minLength: campo.validacoes.tamanhoMinimo
                              ? {
                                  value: campo.validacoes.tamanhoMinimo,
                                  message: `Mínimo de ${campo.validacoes.tamanhoMinimo} caracteres.`,
                                }
                              : undefined,
                            maxLength: campo.validacoes.tamanhoMaximo
                              ? {
                                  value: campo.validacoes.tamanhoMaximo,
                                  message: `Máximo de ${campo.validacoes.tamanhoMaximo} caracteres.`,
                                }
                              : undefined,
                          })}
                        />
                        {campo.descricao ? <p className="text-sm text-slate-500 dark:text-slate-400"><HtmlSeguro html={campo.descricao} /></p> : null}
                        {mensagemErro ? <p className="text-sm text-rose-600">{String(mensagemErro)}</p> : null}
                      </div>
                    )
                  }

                  if (campo.tipo === 'selecao') {
                    return (
                      <div key={chaveRenderizada} className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/55 dark:border-slate-700/70 dark:bg-slate-800/55 p-4" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                        <Label><HtmlSeguro html={rotulo} /></Label>
                        <Controller
                          control={control}
                          name={chaveRenderizada}
                          rules={{ required: campo.obrigatorio ? 'Campo obrigatório.' : false }}
                          render={({ field }) => (
                            <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder={campo.placeholder ?? 'Selecione uma opção'} />
                              </SelectTrigger>
                              <SelectContent>
                                {campo.opcoes.map((opcao) => (
                                  <SelectItem key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {campo.descricao ? <p className="text-sm text-slate-500 dark:text-slate-400"><HtmlSeguro html={campo.descricao} /></p> : null}
                        {mensagemErro ? <p className="text-sm text-rose-600">{String(mensagemErro)}</p> : null}
                      </div>
                    )
                  }

                  if (campo.tipo === 'radio') {
                    return (
                      <div key={chaveRenderizada} className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50/55 dark:border-slate-700/70 dark:bg-slate-800/55 p-4" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                        <Label><HtmlSeguro html={rotulo} /></Label>
                        <div className="space-y-2">
                          {campo.opcoes.map((opcao) => (
                            <label key={opcao.valor} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
                              <input
                                type="radio"
                                value={opcao.valor}
                                {...register(chaveRenderizada, {
                                  required: campo.obrigatorio ? 'Campo obrigatório.' : false,
                                })}
                              />
                              <span>{opcao.rotulo}</span>
                            </label>
                          ))}
                        </div>
                        {mensagemErro ? <p className="text-sm text-rose-600">{String(mensagemErro)}</p> : null}
                      </div>
                    )
                  }

                  if (campo.tipo === 'caixaMarcacao') {
                    return (
                      <div key={chaveRenderizada} className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/55 dark:border-slate-700/70 dark:bg-slate-800/55 p-4" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                        <label className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm font-medium">
                          <input type="checkbox" {...register(chaveRenderizada)} />
                          <span><HtmlSeguro html={rotulo} /></span>
                        </label>
                        {campo.descricao ? <p className="text-sm text-slate-500 dark:text-slate-400"><HtmlSeguro html={campo.descricao} /></p> : null}
                      </div>
                    )
                  }

                  return (
                    <div key={chaveRenderizada} className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/55 dark:border-slate-700/70 dark:bg-slate-800/55 p-4" style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
                      <Label htmlFor={chaveRenderizada}><HtmlSeguro html={rotulo} /></Label>
                      {campo.mascara && MASCARAS[campo.mascara] ? (
                        <Controller
                          control={control}
                          name={chaveRenderizada}
                          rules={{
                            required: campo.obrigatorio ? 'Campo obrigatório.' : false,
                            validate: (valor) => validarValorMascarado(campo, valor),
                          }}
                          render={({ field }) => {
                            const mascaraCfg = MASCARAS[campo.mascara!]
                            return (
                              <div className="relative">
                                <Input
                                  id={chaveRenderizada}
                                  type="text"
                                  inputMode={campo.mascara === 'dinheiro' ? 'numeric' : undefined}
                                  placeholder={campo.placeholder ?? undefined}
                                  maxLength={mascaraCfg.maxLength}
                                  value={String(field.value ?? '')}
                                  onChange={(e) => {
                                    const formatado = mascaraCfg.formato(e.target.value)
                                    field.onChange(formatado)
                                  }}
                                />
                                {campo.mascara === 'cep' && carregandoCep[chaveRenderizada] ? (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 animate-pulse">
                                    Buscando…
                                  </span>
                                ) : null}
                              </div>
                            )
                          }}
                        />
                      ) : (
                        <Input
                          id={chaveRenderizada}
                          type={campo.tipo === 'numero' ? 'number' : campo.tipo === 'email' ? 'email' : campo.tipo === 'data' ? 'date' : 'text'}
                          placeholder={campo.placeholder ?? undefined}
                          {...register(chaveRenderizada, {
                            required: campo.obrigatorio ? 'Campo obrigatório.' : false,
                            minLength: campo.validacoes.tamanhoMinimo
                              ? {
                                  value: campo.validacoes.tamanhoMinimo,
                                  message: `Mínimo de ${campo.validacoes.tamanhoMinimo} caracteres.`,
                                }
                              : undefined,
                            maxLength: campo.validacoes.tamanhoMaximo
                              ? {
                                  value: campo.validacoes.tamanhoMaximo,
                                  message: `Máximo de ${campo.validacoes.tamanhoMaximo} caracteres.`,
                                }
                              : undefined,
                            min: campo.validacoes.valorMinimo
                              ? {
                                  value: campo.validacoes.valorMinimo,
                                  message: `Valor mínimo ${campo.validacoes.valorMinimo}.`,
                                }
                              : undefined,
                            max: campo.validacoes.valorMaximo
                              ? {
                                  value: campo.validacoes.valorMaximo,
                                  message: `Valor máximo ${campo.validacoes.valorMaximo}.`,
                                }
                              : undefined,
                            pattern: campo.validacoes.expressaoRegular
                              ? {
                                  value: new RegExp(campo.validacoes.expressaoRegular),
                                  message: 'Formato inválido.',
                                }
                              : undefined,
                          })}
                        />
                      )}
                      {campo.descricao ? <p className="text-sm text-slate-500 dark:text-slate-400"><HtmlSeguro html={campo.descricao} /></p> : null}
                      {mensagemErro ? <p className="text-sm text-rose-600">{String(mensagemErro)}</p> : null}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/88 px-5 py-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/88">
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Ao enviar, a resposta será salva vinculada à versão publicada atual do formulário.
        </p>
        <Button className="min-w-[180px] shadow-sm" disabled={isSubmitting || submissaoMutation.isPending} type="submit">
          {submissaoMutation.isPending ? 'Enviando...' : 'Enviar resposta'}
        </Button>
      </div>
    </form>
  )
}
