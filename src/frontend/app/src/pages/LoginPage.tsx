import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const schemaLogin = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

type LoginForm = z.input<typeof schemaLogin>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const form = useForm<LoginForm>({
    resolver: zodResolver(schemaLogin),
    defaultValues: { email: '', senha: '' },
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (resposta) => {
      setAuth(resposta.token, resposta.usuario)
      navigate('/')
    },
  })

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md border-slate-300/60 bg-white/95 shadow-sm anim-scale-fade dark:border-slate-700/60 dark:bg-slate-900/95">
        <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_38%),linear-gradient(135deg,_#fff_20%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(135deg,_#1e293b_20%,_#0f172a_100%)]">
          <CardTitle className="text-2xl text-slate-900 dark:text-slate-50">Entrar no sistema</CardTitle>
          <CardDescription>
            Acesse com suas credenciais para gerenciar formulários.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (dados) => {
              await loginMutation.mutateAsync(dados)
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="admin@formulario.local" {...form.register('email')} />
              {form.formState.errors.email ? (
                <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" placeholder="••••••••" {...form.register('senha')} />
              {form.formState.errors.senha ? (
                <p className="text-sm text-rose-600">{form.formState.errors.senha.message}</p>
              ) : null}
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-rose-600">
                {(loginMutation.error as Error)?.message?.includes('400')
                  ? 'Credenciais inválidas.'
                  : 'Erro ao autenticar. Tente novamente.'}
              </p>
            ) : null}
            <Button className="w-full" disabled={loginMutation.isPending} type="submit">
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
