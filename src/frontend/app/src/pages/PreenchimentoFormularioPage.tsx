import { HtmlSeguro } from '@/components/HtmlSeguro'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { obterVersaoPublicadaPorChave } from '@/features/formularios/api'
import { RenderizadorFormulario } from '@/features/formularios/componentes/RenderizadorFormulario'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export function PreenchimentoFormularioPage() {
  const { chave = '' } = useParams()

  const versaoQuery = useQuery({
    queryKey: ['formulario-publicado-chave', chave],
    enabled: Boolean(chave),
    queryFn: () => obterVersaoPublicadaPorChave(chave),
  })

  if (versaoQuery.isLoading) {
    return (
      <div className="space-y-4 anim-fade-in">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (versaoQuery.isError || !versaoQuery.data) {
    return (
      <Card className="border-rose-200 bg-rose-50 anim-fade-up dark:border-rose-800 dark:bg-rose-950">
        <CardHeader>
          <CardTitle>Formulário indisponível</CardTitle>
          <CardDescription>
            Formulário não encontrado ou não está mais ativo.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 anim-fade-up">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-sky-950/40">
          <CardTitle className="text-3xl tracking-tight text-slate-900 dark:text-slate-50">
            <HtmlSeguro html={versaoQuery.data.schema.metadados.titulo} />
          </CardTitle>
          {versaoQuery.data.schema.metadados.descricao ? (
            <CardDescription className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
              <HtmlSeguro html={versaoQuery.data.schema.metadados.descricao} />
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <RenderizadorFormulario
            formularioId={versaoQuery.data.formularioId}
            schema={versaoQuery.data.schema}
          />
        </CardContent>
      </Card>
    </div>
  )
}
