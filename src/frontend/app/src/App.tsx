import { ControlesFlutuantes } from '@/components/ControlesFlutuantes'
import { RotaProtegida } from '@/components/RotaProtegida'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/features/auth/store'
import { useTema } from '@/lib/tema'
import { LoginPage } from '@/pages/LoginPage'
import { LogOut, Menu, Moon, Sun, Users } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'

const PainelFormulariosPage = lazy(() =>
  import('@/pages/PainelFormulariosPage').then((m) => ({ default: m.PainelFormulariosPage }))
)
const SubmissoesVersaoPage = lazy(() =>
  import('@/pages/SubmissoesVersaoPage').then((m) => ({ default: m.SubmissoesVersaoPage }))
)
const GerenciamentoUsuariosPage = lazy(() =>
  import('@/pages/GerenciamentoUsuariosPage').then((m) => ({ default: m.GerenciamentoUsuariosPage }))
)
const PreenchimentoFormularioPage = lazy(() =>
  import('@/pages/PreenchimentoFormularioPage').then((m) => ({ default: m.PreenchimentoFormularioPage }))
)

function PageFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function App() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const { tema, alternarTema } = useTema()
  const location = useLocation()

  const isFormPage = /^\/formularios\/[^/]+\/preencher/.test(location.pathname)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_22%),linear-gradient(180deg,_#0c0c0f_0%,_#111318_100%)] dark:text-slate-100">
      {!isFormPage && (
      <header className="border-b border-slate-200/70 bg-white/80 shadow-[0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-[0_1px_0_rgba(0,0,0,0.3)]">
        <div className="mx-auto flex max-w-7xl flex-row items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700 dark:text-teal-400">Formulario WebApp</p>
            <h1 className="text-[clamp(1.25rem,4.6vw,2.55rem)] font-semibold tracking-tight text-slate-950 dark:text-slate-50">Builder de formulários dinâmicos</h1>
          </div>
          <div className="flex items-start justify-between gap-3 md:items-center">
            {usuario ? (
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3 anim-fade-in md:min-w-[280px] md:flex-none md:items-center md:justify-end">
                {/* Desktop: nome + botão tema + links */}
                <div className="hidden md:flex md:items-center md:gap-4">
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm text-slate-600 dark:text-slate-400">{usuario.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{usuario.ehAdmin ? 'Administrador' : 'Usuário autenticado'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0 bg-white/90 shadow-sm dark:bg-slate-800/90"
                    onClick={alternarTema}
                    aria-label={tema === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                  >
                    {tema === 'escuro' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  {usuario.ehAdmin ? (
                    <Link className="text-sm font-medium text-sky-700 underline underline-offset-4 dark:text-sky-400" to="/usuarios">
                      Usuários
                    </Link>
                  ) : null}
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={logout} type="button">
                    Sair
                  </button>
                </div>

                {/* Mobile: só o menu hambúrguer com tudo dentro */}
                <div className="md:hidden ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button type="button" variant="outline" size="icon-sm" className="bg-white/90 shadow-sm dark:bg-slate-800/90" aria-label="Abrir ações do usuário">
                          <Menu />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{usuario.nome}</p>
                        <p className="text-xs text-slate-500">{usuario.ehAdmin ? 'Administrador' : 'Usuário autenticado'}</p>
                      </div>
                      <DropdownMenuItem onClick={alternarTema}>
                        {tema === 'escuro' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {tema === 'escuro' ? 'Modo claro' : 'Modo escuro'}
                      </DropdownMenuItem>
                      {usuario.ehAdmin ? (
                        <DropdownMenuItem>
                          <Link className="flex w-full items-center gap-2" to="/usuarios">
                            <Users className="h-4 w-4" />
                            Usuários
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0 bg-white/90 shadow-sm dark:bg-slate-800/90"
                  onClick={alternarTema}
                  aria-label={tema === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                >
                  {tema === 'escuro' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {isFormPage && <ControlesFlutuantes />}

      <main className={isFormPage ? 'mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8'}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<PreenchimentoFormularioPage />} path="/formularios/:chave/preencher" />
            <Route
              element={
                <RotaProtegida>
                  <PainelFormulariosPage />
                </RotaProtegida>
              }
              path="/"
            />
            <Route
              element={
                <RotaProtegida>
                  <SubmissoesVersaoPage />
                </RotaProtegida>
              }
              path="/formularios/:formularioId/versoes/:versaoId/submissoes"
            />
            <Route
              element={
                <RotaProtegida apenasAdmin>
                  <GerenciamentoUsuariosPage />
                </RotaProtegida>
              }
              path="/usuarios"
            />
          </Routes>
        </Suspense>
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

export default App
