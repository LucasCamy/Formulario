import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { obterMensagemErroApi } from '@/lib/api'
import { EditarCampoFormInline } from './EditarCampoFormInline'
import { usePainel } from './PainelContext'

export function DialogsFormulario() {
  const {
    confirmacaoPublicar,
    setConfirmacaoPublicar,
    publicarVersaoMutation,
    confirmacaoArquivar,
    setConfirmacaoArquivar,
    arquivarFormularioMutation,
    confirmacaoDesativar,
    setConfirmacaoDesativar,
    desativarFormularioMutation,
    confirmacaoExcluirFormulario,
    setConfirmacaoExcluirFormulario,
    excluirFormularioMutation,
    confirmacaoRemoverSecao,
    setConfirmacaoRemoverSecao,
    removerSecaoMutation,
    confirmacaoRemoverCampo,
    setConfirmacaoRemoverCampo,
    removerCampoMutation,
    confirmacaoRemoverVersao,
    setConfirmacaoRemoverVersao,
    removerVersaoMutation,
    dialogEditarFormularioAberto,
    setDialogEditarFormularioAberto,
    editarFormularioForm,
    editarFormularioMutation,
    dialogEditarSecaoAberto,
    setDialogEditarSecaoAberto,
    editarSecaoForm,
    editarSecaoMutation,
    dialogEditarCampoAberto,
    setDialogEditarCampoAberto,
    editarCampoMutation,
    versaoEmEdicao,
  } = usePainel()

  return (
    <>
      {/* Publicar versão */}
      <AlertDialog open={confirmacaoPublicar} onOpenChange={setConfirmacaoPublicar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar versão?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao publicar, esta versão ficará disponível para preenchimento e não poderá mais ser editada. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={publicarVersaoMutation.isPending} onClick={() => publicarVersaoMutation.mutate()}>
              {publicarVersaoMutation.isPending ? 'Publicando...' : 'Publicar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Arquivar formulário */}
      <AlertDialog open={confirmacaoArquivar} onOpenChange={setConfirmacaoArquivar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              O formulário será marcado como arquivado e não poderá receber novas versões. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={arquivarFormularioMutation.isPending} onClick={() => arquivarFormularioMutation.mutate()}>
              {arquivarFormularioMutation.isPending ? 'Arquivando...' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desativar formulário */}
      <AlertDialog open={confirmacaoDesativar} onOpenChange={setConfirmacaoDesativar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              O link público do formulário ficará indisponível. Você poderá reativá-lo a qualquer momento. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={desativarFormularioMutation.isPending} onClick={() => desativarFormularioMutation.mutate()}>
              {desativarFormularioMutation.isPending ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excluir formulário */}
      <AlertDialog open={confirmacaoExcluirFormulario} onOpenChange={setConfirmacaoExcluirFormulario}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O formulário será permanentemente removido. Formulários com versão publicada não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluirFormularioMutation.isPending}
              onClick={() => excluirFormularioMutation.mutate()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {excluirFormularioMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remover seção */}
      <AlertDialog open={confirmacaoRemoverSecao !== null} onOpenChange={(aberto) => { if (!aberto) setConfirmacaoRemoverSecao(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover seção "{confirmacaoRemoverSecao?.titulo}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os campos desta seção serão removidos junto com ela. A versão deve conter pelo menos uma seção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removerSecaoMutation.isPending}
              onClick={() => { if (confirmacaoRemoverSecao) removerSecaoMutation.mutate(confirmacaoRemoverSecao.id) }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removerSecaoMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remover campo */}
      <AlertDialog open={confirmacaoRemoverCampo !== null} onOpenChange={(aberto) => { if (!aberto) setConfirmacaoRemoverCampo(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover campo "{confirmacaoRemoverCampo?.campo.rotulo}"?</AlertDialogTitle>
            <AlertDialogDescription>
              O campo será permanentemente removido desta versão em rascunho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removerCampoMutation.isPending}
              onClick={() => {
                if (confirmacaoRemoverCampo) {
                  removerCampoMutation.mutate({ secaoId: confirmacaoRemoverCampo.secao.id, campoId: confirmacaoRemoverCampo.campo.id })
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removerCampoMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remover versão */}
      <AlertDialog open={confirmacaoRemoverVersao !== null} onOpenChange={(aberto) => { if (!aberto) setConfirmacaoRemoverVersao(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover versão v{confirmacaoRemoverVersao?.numeroVersao}?</AlertDialogTitle>
            <AlertDialogDescription>
              A versão em rascunho será permanentemente removida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={removerVersaoMutation.isPending}
              onClick={() => { if (confirmacaoRemoverVersao) removerVersaoMutation.mutate(confirmacaoRemoverVersao.id) }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removerVersaoMutation.isPending ? 'Removendo...' : 'Remover versão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editar formulário */}
      <Dialog open={dialogEditarFormularioAberto} onOpenChange={setDialogEditarFormularioAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar formulário</DialogTitle>
            <DialogDescription>Altere o título e a descrição do formulário.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={editarFormularioForm.handleSubmit(async (dados) => {
              await editarFormularioMutation.mutateAsync(dados)
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="editar-form-titulo">Título</Label>
              <Input id="editar-form-titulo" {...editarFormularioForm.register('titulo')} />
              {editarFormularioForm.formState.errors.titulo ? (
                <p className="text-sm text-rose-600">{editarFormularioForm.formState.errors.titulo.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-form-descricao">Descrição</Label>
              <Textarea id="editar-form-descricao" {...editarFormularioForm.register('descricao')} />
            </div>
            <DialogFooter>
              <Button disabled={editarFormularioMutation.isPending} type="submit">
                {editarFormularioMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar seção */}
      <Dialog
        open={dialogEditarSecaoAberto !== null}
        onOpenChange={(aberto) => { if (!aberto) setDialogEditarSecaoAberto(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar seção</DialogTitle>
            <DialogDescription>Altere o título e a descrição da seção.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={editarSecaoForm.handleSubmit(async (dados) => {
              if (!dialogEditarSecaoAberto) return
              await editarSecaoMutation.mutateAsync({ secaoId: dialogEditarSecaoAberto.id, ...dados })
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="editar-secao-titulo">Título</Label>
              <Input id="editar-secao-titulo" {...editarSecaoForm.register('titulo')} />
              {editarSecaoForm.formState.errors.titulo ? (
                <p className="text-sm text-rose-600">{editarSecaoForm.formState.errors.titulo.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editar-secao-descricao">Descrição</Label>
              <Textarea id="editar-secao-descricao" {...editarSecaoForm.register('descricao')} />
            </div>
            <DialogFooter>
              <Button disabled={editarSecaoMutation.isPending} type="submit">
                {editarSecaoMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar campo */}
      <Dialog
        open={dialogEditarCampoAberto !== null}
        onOpenChange={(aberto) => { if (!aberto) setDialogEditarCampoAberto(null) }}
      >
        <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar campo</DialogTitle>
            <DialogDescription>Altere as propriedades do campo "{dialogEditarCampoAberto?.campo.rotulo}".</DialogDescription>
          </DialogHeader>
          {dialogEditarCampoAberto ? (
            <EditarCampoFormInline
              campo={dialogEditarCampoAberto.campo}
              secoes={versaoEmEdicao?.schema.secoes ?? []}
              secaoAtualId={dialogEditarCampoAberto.secao.id}
              isPending={editarCampoMutation.isPending}
              erroServidor={editarCampoMutation.isError ? obterMensagemErroApi(editarCampoMutation.error, 'Erro ao salvar campo.') : null}
              onSubmit={async (dados) => {
                await editarCampoMutation.mutateAsync({
                  campoId: dialogEditarCampoAberto!.campo.id,
                  secaoId: dados.secaoId,
                  rotulo: dados.rotulo,
                  descricao: dados.descricao,
                  placeholder: dados.placeholder,
                  mascara: dados.mascara,
                  obrigatorio: dados.obrigatorio,
                  valorUnico: dados.valorUnico,
                  opcoes: dados.opcoes,
                  repeticao: dados.repeticao,
                })
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
