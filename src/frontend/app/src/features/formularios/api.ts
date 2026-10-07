import type {
  AdicionarCampoPayload,
  BuilderFormularioDto,
  CriarFormularioPayload,
  EditarCampoPayload,
  FormularioDetalheDto,
  FormularioResumoDto,
  SubmissaoDto,
  VersaoFormularioResumoDto,
} from "@/features/formularios/tipos";
import { clienteApi } from "@/lib/api";

export async function listarFormularios() {
  const resposta =
    await clienteApi.get<FormularioResumoDto[]>("/api/formularios");
  return resposta.data;
}

export async function obterFormularioPorId(formularioId: string) {
  const resposta = await clienteApi.get<FormularioDetalheDto>(
    `/api/formularios/${formularioId}`,
  );
  return resposta.data;
}

export async function obterBuilderFormulario(formularioId: string) {
  const resposta = await clienteApi.get<BuilderFormularioDto>(
    `/api/formularios/${formularioId}/builder`,
  );
  return resposta.data;
}

export async function obterVersaoPublicada(formularioId: string) {
  const resposta = await clienteApi.get<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/publicado`,
  );
  return resposta.data;
}

export async function obterVersaoPublicadaPorChave(chave: string) {
  const resposta = await clienteApi.get<VersaoFormularioResumoDto>(
    `/api/formularios/chave/${chave}/publicado`,
  );
  return resposta.data;
}

export async function criarFormulario(payload: CriarFormularioPayload) {
  const resposta = await clienteApi.post<FormularioResumoDto>(
    "/api/formularios",
    payload,
  );
  return resposta.data;
}

export async function criarVersaoRascunho(
  formularioId: string,
  criadoPor: string,
) {
  const resposta = await clienteApi.post<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes`,
    {
      criadoPor,
    },
  );

  return resposta.data;
}

export async function adicionarSecao(
  formularioId: string,
  versaoId: string,
  titulo: string,
  descricao: string | undefined,
  alteradoPor: string,
) {
  const resposta = await clienteApi.post<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes`,
    { titulo, descricao, alteradoPor },
  );
  return resposta.data;
}

export async function adicionarCampo(
  formularioId: string,
  versaoId: string,
  payload: AdicionarCampoPayload,
) {
  const resposta = await clienteApi.post<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/campos`,
    payload,
  );

  return resposta.data;
}

export async function publicarVersao(
  formularioId: string,
  versaoId: string,
  publicadoPor: string,
) {
  const resposta = await clienteApi.post<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/publicar`,
    { publicadoPor },
  );

  return resposta.data;
}

export async function arquivarFormulario(
  formularioId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.post<FormularioResumoDto>(
    `/api/formularios/${formularioId}/arquivar`,
    {
      alteradoPor,
    },
  );

  return resposta.data;
}

export async function desativarFormulario(
  formularioId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.post<FormularioResumoDto>(
    `/api/formularios/${formularioId}/desativar`,
    { alteradoPor },
  );

  return resposta.data;
}

export async function ativarFormulario(
  formularioId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.post<FormularioResumoDto>(
    `/api/formularios/${formularioId}/ativar`,
    { alteradoPor },
  );

  return resposta.data;
}

export async function editarFormulario(
  formularioId: string,
  titulo: string,
  descricao: string | undefined,
  alteradoPor: string,
) {
  const resposta = await clienteApi.put<FormularioResumoDto>(
    `/api/formularios/${formularioId}`,
    { titulo, descricao, alteradoPor },
  );
  return resposta.data;
}

export async function excluirFormulario(
  formularioId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.delete<FormularioResumoDto>(
    `/api/formularios/${formularioId}`,
    { data: { alteradoPor } },
  );
  return resposta.data;
}

export async function editarSecao(
  formularioId: string,
  versaoId: string,
  secaoId: string,
  titulo: string,
  descricao: string | undefined,
  alteradoPor: string,
) {
  const resposta = await clienteApi.put<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/${secaoId}`,
    { titulo, descricao, alteradoPor },
  );
  return resposta.data;
}

export async function removerSecao(
  formularioId: string,
  versaoId: string,
  secaoId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.delete<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/${secaoId}`,
    { data: { alteradoPor } },
  );
  return resposta.data;
}

export async function editarCampo(
  formularioId: string,
  versaoId: string,
  secaoId: string,
  campoId: string,
  payload: EditarCampoPayload,
) {
  const resposta = await clienteApi.put<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/${secaoId}/campos/${campoId}`,
    payload,
  );
  return resposta.data;
}

export async function removerCampo(
  formularioId: string,
  versaoId: string,
  secaoId: string,
  campoId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.delete<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/${secaoId}/campos/${campoId}`,
    { data: { alteradoPor } },
  );
  return resposta.data;
}

export async function removerVersao(
  formularioId: string,
  versaoId: string,
  alteradoPor: string,
) {
  const resposta = await clienteApi.delete<FormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}`,
    { data: { alteradoPor } },
  );
  return resposta.data;
}

export async function submeterFormulario(
  formularioId: string,
  dadosResposta: Record<string, unknown>,
  criadoPor: string,
) {
  const resposta = await clienteApi.post<SubmissaoDto>(
    `/api/formularios/${formularioId}/submissoes`,
    {
      dadosResposta,
      criadoPor,
      metadados: {
        origem: "frontend-web",
      },
    },
  );

  return resposta.data;
}

export async function listarSubmissoesPorVersao(
  formularioId: string,
  versaoId: string,
) {
  const resposta = await clienteApi.get<SubmissaoDto[]>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/submissoes`,
  );

  return resposta.data;
}

export async function reordenarCampos(
  formularioId: string,
  versaoId: string,
  secaoId: string,
  campos: { campoId: string; ordem: number; larguraColunas: number }[],
  alteradoPor: string,
) {
  const resposta = await clienteApi.put<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/${secaoId}/campos/reordenar`,
    { campos, alteradoPor },
  );
  return resposta.data;
}

export async function reordenarSecoes(
  formularioId: string,
  versaoId: string,
  secoes: { secaoId: string; ordem: number }[],
  alteradoPor: string,
) {
  const resposta = await clienteApi.put<VersaoFormularioResumoDto>(
    `/api/formularios/${formularioId}/versoes/${versaoId}/secoes/reordenar`,
    { secoes, alteradoPor },
  );
  return resposta.data;
}
