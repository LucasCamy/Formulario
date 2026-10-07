import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarUsuario, listarUsuarios, removerUsuario } from '@/features/auth/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schemaCriarUsuario = z.object({
  nome: z.string().min(2, 'Informe o nome.'),
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(6, 'Mínimo de 6 caracteres.'),
  ehAdmin: z.boolean().default(false),
})

type CriarUsuarioForm = z.input<typeof schemaCriarUsuario>

export function GerenciamentoUsuariosPage() {
  const queryClient = useQueryClient()
  const [dialogAberto, setDialogAberto] = useState(false)

  const usuariosQuery = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  })

  const form = useForm<CriarUsuarioForm>({
    resolver: zodResolver(schemaCriarUsuario),
    defaultValues: { nome: '', email: '', senha: '', ehAdmin: false },
  })

  const criarMutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: async () => {
      form.reset()
      setDialogAberto(false)
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const removerMutation = useMutation({
    mutationFn: removerUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6 anim-fade-up">
      <Card className="overflow-hidden border-slate-300/60 bg-white/95 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/95">
        <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_38%),linear-gradient(135deg,_#fff_20%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(135deg,_#1e293b_20%,_#0f172a_100%)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-50">Gerenciamento de usuários</CardTitle>
              <CardDescription>Crie, edite e remova usuários do sistema.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setDialogAberto(true)} type="button">
              Novo usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 anim-stagger">
            {usuariosQuery.data?.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-900 dark:text-slate-100">{usuario.nome}</strong>
                    {usuario.ehAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">Usuário</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{usuario.email}</p>
                </div>
                <Button
                  disabled={removerMutation.isPending}
                  onClick={() => removerMutation.mutate(usuario.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Remover
                </Button>
              </div>
            ))}
            {usuariosQuery.data?.length === 0 ? (
              <p className="text-center text-sm text-slate-500">Nenhum usuário cadastrado.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar usuário</DialogTitle>
            <DialogDescription>Adicione um novo usuário ao sistema.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (dados) => {
              await criarMutation.mutateAsync({ ...dados, ehAdmin: dados.ehAdmin ?? false })
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="usuario-nome">Nome</Label>
              <Input id="usuario-nome" {...form.register('nome')} />
              {form.formState.errors.nome ? (
                <p className="text-sm text-rose-600">{form.formState.errors.nome.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-email">E-mail</Label>
              <Input id="usuario-email" type="email" {...form.register('email')} />
              {form.formState.errors.email ? (
                <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario-senha">Senha</Label>
              <Input id="usuario-senha" type="password" {...form.register('senha')} />
              {form.formState.errors.senha ? (
                <p className="text-sm text-rose-600">{form.formState.errors.senha.message}</p>
              ) : null}
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input type="checkbox" {...form.register('ehAdmin')} />
              Administrador
            </label>
            {criarMutation.isError ? (
              <p className="text-sm text-rose-600">Erro ao criar usuário. Verifique se o e-mail já existe.</p>
            ) : null}
            <DialogFooter>
              <Button disabled={criarMutation.isPending} type="submit">
                {criarMutation.isPending ? 'Criando...' : 'Criar usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
