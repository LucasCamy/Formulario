import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listarSubmissoesPorVersao, obterBuilderFormulario } from '@/features/formularios/api'
import type { CampoFormularioSchema, SubmissaoDto, VersaoFormularioResumoDto } from '@/features/formularios/tipos'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

function formatarData(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function obterCampos(versao: VersaoFormularioResumoDto): CampoFormularioSchema[] {
  return versao.schema.secoes.flatMap((s) => s.campos).sort((a, b) => a.ordem - b.ordem)
}

function parseDados(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

function valorParaTexto(valor: unknown, mascara?: string | null): string {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (typeof valor === 'object') return JSON.stringify(valor)
  const str = String(valor)
  if (mascara === 'dinheiro') {
    // "R$ 1.234,56" → "1234.56" para compatibilidade com planilhas
    const numerico = str.replace(/[R$\s.]/g, '').replace(',', '.')
    const n = Number(numerico)
    return isNaN(n) ? str : String(n)
  }
  return str
}

function coletarInstancias(campo: CampoFormularioSchema, dados: Record<string, unknown>): string[] {
  if (!campo.repeticao) return []
  const instancias: string[] = []
  let i = 1
  while (dados[`${campo.chave}__${i}`] !== undefined) {
    const txt = valorParaTexto(dados[`${campo.chave}__${i}`], campo.mascara)
    if (txt) instancias.push(txt)
    i++
  }
  return instancias
}

function CelulaValor({ campo, dados }: { campo: CampoFormularioSchema; dados: Record<string, unknown> }) {
  if (!campo.repeticao) {
    return <>{valorParaTexto(dados[campo.chave], campo.mascara)}</>
  }
  const instancias = coletarInstancias(campo, dados)
  if (instancias.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {instancias.map((v, i) => (
        <span key={i} className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {v}
        </span>
      ))}
    </div>
  )
}

function escaparCsv(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

function exportarCsv(
  submissoes: SubmissaoDto[],
  campos: CampoFormularioSchema[],
  nomeFormulario: string,
  numeroVersao: number,
) {
  const cabecalho = ['Enviado por', 'Data de envio', ...campos.map((c) => c.rotulo)]
    .map(escaparCsv)
    .join(',')

  const linhas = submissoes.map((s) => {
    const dados = parseDados(s.dadosRespostaJson)
    const valores = [
      s.criadoPor,
      formatarData(s.criadoEm),
      ...campos.map((c) => {
        const instancias = coletarInstancias(c, dados)
        if (instancias.length > 0) {
          return escaparCsv(instancias.join(' | '))
        }
        return escaparCsv(valorParaTexto(dados[c.chave], c.mascara))
      }),
    ]
    return valores.map(escaparCsv).join(',')
  })

  const csv = [cabecalho, ...linhas].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `submissoes-${nomeFormulario.toLowerCase().replace(/\s+/g, '-')}-v${numeroVersao}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function SubmissoesVersaoPage() {
  const { formularioId, versaoId } = useParams<{ formularioId: string; versaoId: string }>()

  const builderQuery = useQuery({
    queryKey: ['builder-formulario', formularioId],
    enabled: Boolean(formularioId),
    queryFn: () => obterBuilderFormulario(formularioId!),
  })

  const submissoesQuery = useQuery({
    queryKey: ['submissoes', formularioId, versaoId],
    enabled: Boolean(formularioId) && Boolean(versaoId),
    queryFn: () => listarSubmissoesPorVersao(formularioId!, versaoId!),
  })

  const versao = builderQuery.data?.formulario.versoes.find((v) => v.id === versaoId)
  const campos = versao ? obterCampos(versao) : []
  const submissoes = submissoesQuery.data ?? []
  const formulario = builderQuery.data?.formulario

  const isLoading = builderQuery.isLoading || submissoesQuery.isLoading

  return (
    <div className="space-y-6 anim-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            to="/"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            {builderQuery.isLoading ? (
              <Skeleton className="h-7 w-52" />
            ) : (
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {formulario?.titulo ?? 'Formulário'}
              </h2>
            )}
            <div className="mt-1 flex items-center gap-2">
              {versao ? (
                <>
                  <Badge variant="outline" className="text-xs">
                    Versão {versao.numeroVersao}
                  </Badge>
                  <Badge
                    variant={versao.statusPublicacao === 'publicada' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {versao.statusPublicacao === 'publicada'
                      ? 'Publicada'
                      : versao.statusPublicacao === 'arquivada'
                        ? 'Arquivada'
                        : 'Rascunho'}
                  </Badge>
                </>
              ) : builderQuery.isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : null}
            </div>
          </div>
        </div>
        <Button
          disabled={submissoes.length === 0 || !versao || !formulario}
          onClick={() => exportarCsv(submissoes, campos, formulario!.titulo, versao!.numeroVersao)}
          variant="outline"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Table card */}
      <Card className="border-slate-300/60 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/90">
        <CardHeader>
          <CardTitle className="text-base">Respostas recebidas</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Carregando...'
              : `${submissoes.length} ${submissoes.length === 1 ? 'resposta' : 'respostas'} para esta versão`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : submissoes.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhuma resposta enviada para esta versão ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Enviado por</TableHead>
                    <TableHead className="whitespace-nowrap">Data de envio</TableHead>
                    {campos.map((campo) => (
                      <TableHead key={campo.id} className="whitespace-nowrap">
                        {campo.rotulo}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissoes.map((submissao) => {
                    const dados = parseDados(submissao.dadosRespostaJson)
                    return (
                      <TableRow key={submissao.id}>
                        <TableCell className="font-medium">{submissao.criadoPor}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-500">
                          {formatarData(submissao.criadoEm)}
                        </TableCell>
                        {campos.map((campo) => (
                          <TableCell key={campo.id}>
                            <CelulaValor campo={campo} dados={dados} />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
