import { Badge } from '@/components/ui/badge'
import type { CampoFormularioSchema } from '@/features/formularios/tipos'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Columns2, Columns3, GripVertical, RectangleHorizontal, Square } from 'lucide-react'

export function CampoSortavel({
  campo,
  onAlterarLargura,
}: {
  campo: CampoFormularioSchema
  onAlterarLargura: (largura: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: campo.id })
  const largura = campo.larguraColunas ?? 12

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, opacity 0.2s ease` : 'opacity 0.2s ease',
    gridColumn: `span ${largura} / span ${largura}`,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <button
            type="button"
            className="mt-0.5 cursor-grab rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-700 dark:hover:text-slate-300"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-slate-900 dark:text-slate-100">{campo.rotulo}</strong>
              <Badge variant="outline">{campo.tipo}</Badge>
              {campo.obrigatorio ? <Badge>Obrigatório</Badge> : null}
              {campo.repeticao ? <Badge variant="secondary">Repete ({campo.repeticao.campoDependencia})</Badge> : null}
              <Badge variant="secondary" className="text-xs">{largura}/12</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{campo.descricao || campo.placeholder || 'Sem descrição adicional.'}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{campo.chave}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900 self-start">
          <button
            type="button"
            title="Largura total (12/12)"
            className={`rounded p-1 transition ${largura === 12 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => onAlterarLargura(12)}
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Dois terços (8/12)"
            className={`rounded p-1 transition ${largura === 8 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => onAlterarLargura(8)}
          >
            <RectangleHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Metade (6/12)"
            className={`rounded p-1 transition ${largura === 6 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => onAlterarLargura(6)}
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Terço (4/12)"
            className={`rounded p-1 transition ${largura === 4 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => onAlterarLargura(4)}
          >
            <Columns3 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
