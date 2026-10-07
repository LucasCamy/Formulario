export type TipoCampo =
  | "textoCurto"
  | "textoLongo"
  | "numero"
  | "email"
  | "data"
  | "selecao"
  | "radio"
  | "caixaMarcacao";

export type StatusPublicacaoVersao = "rascunho" | "publicada" | "arquivada";
export type StatusSubmissao = "recebida" | "processada" | "rejeitada";

export interface ValidacoesCampoSchema {
  tamanhoMinimo?: number | null;
  tamanhoMaximo?: number | null;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  expressaoRegular?: string | null;
}

export interface RegraVisibilidadeSchema {
  campoDependencia: string;
  operador: string;
  valorEsperado: string;
}

export interface RegraRepeticaoSchema {
  campoDependencia: string;
  limiteMaximo?: number;
}

export interface OpcaoCampoSchema {
  rotulo: string;
  valor: string;
}

export interface CampoFormularioSchema {
  id: string;
  chave: string;
  tipo: TipoCampo;
  rotulo: string;
  descricao?: string | null;
  obrigatorio: boolean;
  placeholder?: string | null;
  mascara?: string | null;
  ordem: number;
  larguraColunas?: number;
  valorUnico?: boolean;
  validacoes: ValidacoesCampoSchema;
  visibilidade?: RegraVisibilidadeSchema | null;
  repeticao?: RegraRepeticaoSchema | null;
  opcoes: OpcaoCampoSchema[];
}

export interface SecaoFormularioSchema {
  id: string;
  titulo: string;
  descricao?: string | null;
  ordem: number;
  campos: CampoFormularioSchema[];
}

export interface MetadadosFormularioSchema {
  titulo: string;
  descricao?: string | null;
  multipaginas: boolean;
}

export interface SchemaFormulario {
  versaoSchema: string;
  metadados: MetadadosFormularioSchema;
  secoes: SecaoFormularioSchema[];
}

export interface VersaoFormularioResumoDto {
  id: string;
  formularioId: string;
  numeroVersao: number;
  statusPublicacao: StatusPublicacaoVersao;
  criadoEm: string;
  publicadoEm?: string | null;
  schema: SchemaFormulario;
}

export interface FormularioResumoDto {
  id: string;
  titulo: string;
  descricao?: string | null;
  chave: string;
  arquivado: boolean;
  ativo: boolean;
  versaoPublicadaId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FormularioDetalheDto extends FormularioResumoDto {
  versoes: VersaoFormularioResumoDto[];
}

export interface TipoCampoCatalogoDto {
  codigo: string;
  nome: string;
  descricao: string;
  aceitaOpcoes: boolean;
  aceitaMascara: boolean;
  aceitaValidacoes: boolean;
}

export interface BuilderFormularioDto {
  formulario: FormularioDetalheDto;
  versaoEmEdicao?: VersaoFormularioResumoDto | null;
  versaoPublicada?: VersaoFormularioResumoDto | null;
  tiposCampoDisponiveis: TipoCampoCatalogoDto[];
}

export interface SubmissaoDto {
  id: string;
  formularioId: string;
  versaoFormularioId: string;
  status: StatusSubmissao;
  dadosRespostaJson: string;
  metadadosJson?: string | null;
  criadoPor: string;
  criadoEm: string;
}

export interface CriarFormularioPayload {
  titulo: string;
  descricao?: string;
  chave: string;
  criadoPor: string;
}

export interface AdicionarCampoPayload {
  secaoId?: string;
  chave: string;
  rotulo: string;
  descricao?: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  placeholder?: string;
  mascara?: string;
  ordem: number;
  validacoes?: ValidacoesCampoSchema;
  visibilidade?: RegraVisibilidadeSchema;
  opcoes?: OpcaoCampoSchema[];
  valorUnico?: boolean;
  repeticao?: RegraRepeticaoSchema;
  alteradoPor: string;
}

export interface EditarCampoPayload {
  rotulo: string;
  descricao?: string;
  placeholder?: string;
  mascara?: string;
  obrigatorio: boolean;
  valorUnico?: boolean;
  opcoes?: OpcaoCampoSchema[];
  repeticao?: RegraRepeticaoSchema | null;
  alteradoPor: string;
}
