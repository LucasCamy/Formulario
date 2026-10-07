export interface UsuarioDto {
  id: string;
  nome: string;
  email: string;
  ehAdmin: boolean;
  criadoEm: string;
}

export interface LoginRespostaDto {
  token: string;
  usuario: UsuarioDto;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  ehAdmin: boolean;
}

export interface AtualizarUsuarioPayload {
  nome: string;
  email: string;
  ehAdmin: boolean;
  novaSenha?: string;
}
