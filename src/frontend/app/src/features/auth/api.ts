import { clienteApi } from "@/lib/api";
import type {
    AtualizarUsuarioPayload,
    CriarUsuarioPayload,
    LoginPayload,
    LoginRespostaDto,
    UsuarioDto,
} from "./tipos";

export async function login(payload: LoginPayload) {
  const resposta = await clienteApi.post<LoginRespostaDto>(
    "/api/auth/login",
    payload,
  );
  return resposta.data;
}

export async function listarUsuarios() {
  const resposta = await clienteApi.get<UsuarioDto[]>("/api/usuarios");
  return resposta.data;
}

export async function criarUsuario(payload: CriarUsuarioPayload) {
  const resposta = await clienteApi.post<UsuarioDto>("/api/usuarios", payload);
  return resposta.data;
}

export async function atualizarUsuario(
  id: string,
  payload: AtualizarUsuarioPayload,
) {
  const resposta = await clienteApi.put<UsuarioDto>(
    `/api/usuarios/${id}`,
    payload,
  );
  return resposta.data;
}

export async function removerUsuario(id: string) {
  await clienteApi.delete(`/api/usuarios/${id}`);
}
