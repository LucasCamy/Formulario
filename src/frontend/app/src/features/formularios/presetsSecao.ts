import type {
    OpcaoCampoSchema,
    TipoCampo,
    ValidacoesCampoSchema,
} from "./tipos";

export interface CampoPreset {
  chave: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  placeholder?: string;
  mascara?: string;
  descricao?: string;
  larguraColunas: number;
  opcoes?: OpcaoCampoSchema[];
  validacoes?: ValidacoesCampoSchema;
}

export interface PresetSecao {
  id: string;
  titulo: string;
  descricao: string;
  campos: CampoPreset[];
}

const UFS_BRASIL: OpcaoCampoSchema[] = [
  { rotulo: "AC", valor: "AC" },
  { rotulo: "AL", valor: "AL" },
  { rotulo: "AP", valor: "AP" },
  { rotulo: "AM", valor: "AM" },
  { rotulo: "BA", valor: "BA" },
  { rotulo: "CE", valor: "CE" },
  { rotulo: "DF", valor: "DF" },
  { rotulo: "ES", valor: "ES" },
  { rotulo: "GO", valor: "GO" },
  { rotulo: "MA", valor: "MA" },
  { rotulo: "MT", valor: "MT" },
  { rotulo: "MS", valor: "MS" },
  { rotulo: "MG", valor: "MG" },
  { rotulo: "PA", valor: "PA" },
  { rotulo: "PB", valor: "PB" },
  { rotulo: "PR", valor: "PR" },
  { rotulo: "PE", valor: "PE" },
  { rotulo: "PI", valor: "PI" },
  { rotulo: "RJ", valor: "RJ" },
  { rotulo: "RN", valor: "RN" },
  { rotulo: "RS", valor: "RS" },
  { rotulo: "RO", valor: "RO" },
  { rotulo: "RR", valor: "RR" },
  { rotulo: "SC", valor: "SC" },
  { rotulo: "SP", valor: "SP" },
  { rotulo: "SE", valor: "SE" },
  { rotulo: "TO", valor: "TO" },
];

const SEXO_OPCOES: OpcaoCampoSchema[] = [
  { rotulo: "Masculino", valor: "Masculino" },
  { rotulo: "Feminino", valor: "Feminino" },
  { rotulo: "Outro", valor: "Outro" },
  { rotulo: "Prefiro não informar", valor: "Prefiro não informar" },
];

export const PRESETS_SECAO: PresetSecao[] = [
  {
    id: "endereco",
    titulo: "Endereço",
    descricao:
      "CEP com busca automática, Rua, Número, Bairro, Complemento, Cidade e UF.",
    campos: [
      {
        chave: "cep",
        rotulo: "CEP",
        tipo: "numero",
        mascara: "cep",
        obrigatorio: true,
        placeholder: "00000-000",
        larguraColunas: 4,
      },
      {
        chave: "rua",
        rotulo: "Rua",
        tipo: "textoCurto",
        obrigatorio: true,
        placeholder: "Logradouro",
        larguraColunas: 8,
      },
      {
        chave: "numero",
        rotulo: "Número",
        tipo: "textoCurto",
        obrigatorio: true,
        placeholder: "Nº",
        larguraColunas: 4,
      },
      {
        chave: "bairro",
        rotulo: "Bairro",
        tipo: "textoCurto",
        obrigatorio: true,
        larguraColunas: 4,
      },
      {
        chave: "complemento",
        rotulo: "Complemento",
        tipo: "textoCurto",
        obrigatorio: false,
        placeholder: "Apto, Bloco, etc.",
        larguraColunas: 4,
      },
      {
        chave: "cidade",
        rotulo: "Cidade",
        tipo: "textoCurto",
        obrigatorio: true,
        larguraColunas: 8,
      },
      {
        chave: "uf",
        rotulo: "UF",
        tipo: "selecao",
        obrigatorio: true,
        opcoes: UFS_BRASIL,
        larguraColunas: 4,
      },
    ],
  },
  {
    id: "dados-pessoais",
    titulo: "Dados Pessoais",
    descricao:
      "Nome Completo, CPF, Data de Nascimento, Sexo, E-mail, Telefone e Celular.",
    campos: [
      {
        chave: "nome-completo",
        rotulo: "Nome Completo",
        tipo: "textoCurto",
        obrigatorio: true,
        larguraColunas: 12,
        validacoes: { tamanhoMinimo: 3, tamanhoMaximo: 200 },
      },
      {
        chave: "cpf",
        rotulo: "CPF",
        tipo: "numero",
        mascara: "cpf",
        obrigatorio: true,
        placeholder: "000.000.000-00",
        larguraColunas: 6,
      },
      {
        chave: "data-nascimento",
        rotulo: "Data de Nascimento",
        tipo: "data",
        obrigatorio: true,
        larguraColunas: 6,
      },
      {
        chave: "sexo",
        rotulo: "Sexo",
        tipo: "selecao",
        obrigatorio: false,
        opcoes: SEXO_OPCOES,
        larguraColunas: 4,
      },
      {
        chave: "email",
        rotulo: "E-mail",
        tipo: "email",
        obrigatorio: true,
        placeholder: "exemplo@email.com",
        larguraColunas: 8,
      },
      {
        chave: "telefone",
        rotulo: "Telefone",
        tipo: "numero",
        mascara: "telefone",
        obrigatorio: false,
        placeholder: "(00) 0000-0000",
        larguraColunas: 6,
      },
      {
        chave: "celular",
        rotulo: "Celular",
        tipo: "numero",
        mascara: "telefone",
        obrigatorio: true,
        placeholder: "(00) 00000-0000",
        larguraColunas: 6,
      },
    ],
  },
];
