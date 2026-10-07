import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/features/auth/store'
import { useTema } from '@/lib/tema'
import { LogOut, Moon, Sun, User } from 'lucide-react'

export function ControlesFlutuantes() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const { tema, alternarTema } = useTema()

  const iniciais = usuario?.nome
    ? usuario.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
    : null

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center">
      <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-slate-200/70 bg-white/80 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Tema */}
        <button
          type="button"
          onClick={alternarTema}
          aria-label={tema === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {tema === 'escuro' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Usuário (quando logado) */}
        {usuario ? (
          <>
            <div className="my-0.5 h-px w-5 bg-slate-200/80 dark:bg-slate-700/80" />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Opções do usuário"
                    title={usuario.nome}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-[11px] font-bold text-white transition-colors hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
                  >
                    {iniciais ?? <User className="h-3.5 w-3.5" />}
                  </button>
                }
              />
              <DropdownMenuContent align="end" side="left" sideOffset={10} className="w-52">
                <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{usuario.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {usuario.ehAdmin ? 'Administrador' : 'Usuário autenticado'}
                  </p>
                </div>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>
    </div>
  )
}
