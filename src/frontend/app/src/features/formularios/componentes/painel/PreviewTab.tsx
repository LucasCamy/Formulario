import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CampoFormularioSchema, SecaoFormularioSchema } from '@/features/formularios/tipos'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useCallback } from 'react'
import { CampoSortavel } from './CampoSortavel'
import { usePainel } from './PainelContext'

export function PreviewTab() {
  const { versaoEmEdicao, onReordenarCampos, reordenarSecoesMutation } = usePainel()

  const secoesOrdenadas = versaoEmEdicao
    ? [...versaoEmEdicao.schema.secoes].sort((a, b) => a.ordem - b.ordem)
    : []

  function moverSecao(secaoId: string, direcao: 'cima' | 'baixo') {
    const idx = secoesOrdenadas.findIndex((s) => s.id === secaoId)
    if (idx < 0) return
    const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1
    if (novoIdx < 0 || novoIdx >= secoesOrdenadas.length) return

    const reordenadas = secoesOrdenadas.map((s, i) => {
      if (i === idx) return { secaoId: s.id, ordem: novoIdx + 1 }
      if (i === novoIdx) return { secaoId: s.id, ordem: idx + 1 }
      return { secaoId: s.id, ordem: i + 1 }
    })
    reordenarSecoesMutation.mutate({ secoes: reordenadas })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback((secao: SecaoFormularioSchema) => (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const campos = [...secao.campos].sort((a, b) => a.ordem - b.ordem)
    const oldIndex = campos.findIndex((c) => c.id === active.id)
    const newIndex = campos.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const [moved] = campos.splice(oldIndex, 1)
    campos.splice(newIndex, 0, moved)

    onReordenarCampos({
      secaoId: secao.id,
      campos: campos.map((c, i) => ({
        campoId: c.id,
        ordem: i + 1,
        larguraColunas: c.larguraColunas ?? 12,
      })),
    })
  }, [onReordenarCampos])

  const handleAlterarLargura = useCallback((secao: SecaoFormularioSchema, campoId: string, novaLargura: number) => {
    onReordenarCampos({
      secaoId: secao.id,
      campos: secao.campos.map((c) => ({
        campoId: c.id,
        ordem: c.ordem,
        larguraColunas: c.id === campoId ? novaLargura : (c.larguraColunas ?? 12),
      })),
    })
  }, [onReordenarCampos])

  return (
    <div className="space-y-4">
      <Card className="border-slate-300/60 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Organização do layout</CardTitle>
          <CardDescription>
            Arraste os campos para reordená-los, escolha a largura de cada um e use as setas para definir a ordem das seções.
          </CardDescription>
        </CardHeader>
      </Card>

      {secoesOrdenadas.map((secao, secaoIdx) => {
        const ehRascunho = versaoEmEdicao?.statusPublicacao === 'rascunho'
        const ehPrimeira = secaoIdx === 0
        const ehUltima = secaoIdx === secoesOrdenadas.length - 1
        const camposOrdenados = [...secao.campos].sort((a, b) => a.ordem - b.ordem)
        return (
          <Card key={secao.id} className="border-slate-300/60 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/95">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg">{secao.titulo}</CardTitle>
                  {secao.descricao ? <CardDescription className="mt-1">{secao.descricao}</CardDescription> : null}
                </div>
                {ehRascunho && secoesOrdenadas.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      disabled={ehPrimeira || reordenarSecoesMutation.isPending}
                      onClick={() => moverSecao(secao.id, 'cima')}
                      aria-label="Mover seção para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      disabled={ehUltima || reordenarSecoesMutation.isPending}
                      onClick={() => moverSecao(secao.id, 'baixo')}
                      aria-label="Mover seção para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {secao.campos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum campo nesta seção.</p>
              ) : ehRascunho ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(secao)}>
                  <SortableContext items={camposOrdenados.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="preview-campos-grid grid grid-cols-12 gap-3">
                      {camposOrdenados.map((campo: CampoFormularioSchema) => (
                        <CampoSortavel
                          key={campo.id}
                          campo={campo}
                          onAlterarLargura={(largura) => handleAlterarLargura(secao, campo.id, largura)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="preview-campos-grid grid grid-cols-12 gap-3">
                  {camposOrdenados.map((campo: CampoFormularioSchema) => (
                    <div
                      key={campo.id}
                      className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
                      style={{ gridColumn: `span ${campo.larguraColunas ?? 12} / span ${campo.larguraColunas ?? 12}` }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-900 dark:text-slate-100">{campo.rotulo}</strong>
                        <Badge variant="outline">{campo.tipo}</Badge>
                        {campo.obrigatorio ? <Badge>Obrigatório</Badge> : null}
                        <Badge variant="secondary" className="text-xs">{campo.larguraColunas ?? 12}/12</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{campo.descricao || campo.placeholder || 'Sem descrição adicional.'}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{campo.chave}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
