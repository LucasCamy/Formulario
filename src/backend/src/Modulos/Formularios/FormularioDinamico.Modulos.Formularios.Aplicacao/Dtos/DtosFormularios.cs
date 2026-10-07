using FormularioDinamico.Modulos.Formularios.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.Dtos;

public sealed record FormularioResumoDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    string Chave,
    bool Arquivado,
    bool Ativo,
    Guid? VersaoPublicadaId,
    DateTimeOffset CriadoEm,
    DateTimeOffset AtualizadoEm);

public sealed record VersaoFormularioResumoDto(
    Guid Id,
    Guid FormularioId,
    int NumeroVersao,
    StatusPublicacaoVersao StatusPublicacao,
    DateTimeOffset CriadoEm,
    DateTimeOffset? PublicadoEm,
    SchemaFormulario Schema);

public sealed record FormularioDetalheDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    string Chave,
    bool Arquivado,
    bool Ativo,
    Guid? VersaoPublicadaId,
    IReadOnlyCollection<VersaoFormularioResumoDto> Versoes,
    DateTimeOffset CriadoEm,
    DateTimeOffset AtualizadoEm);

public sealed record TipoCampoCatalogoDto(
    string Codigo,
    string Nome,
    string Descricao,
    bool AceitaOpcoes,
    bool AceitaMascara,
    bool AceitaValidacoes);

public sealed record BuilderFormularioDto(
    FormularioDetalheDto Formulario,
    VersaoFormularioResumoDto? VersaoEmEdicao,
    VersaoFormularioResumoDto? VersaoPublicada,
    IReadOnlyCollection<TipoCampoCatalogoDto> TiposCampoDisponiveis);

public sealed record SubmissaoDto(
    Guid Id,
    Guid FormularioId,
    Guid VersaoFormularioId,
    StatusSubmissao Status,
    string DadosRespostaJson,
    string? MetadadosJson,
    string CriadoPor,
    DateTimeOffset CriadoEm);

public static class MapeadorDtosFormularios
{
    public static FormularioResumoDto ParaResumoDto(this Formulario formulario)
    {
        return new FormularioResumoDto(
            formulario.Id,
            formulario.Titulo,
            formulario.Descricao,
            formulario.Chave,
            formulario.Arquivado,
            formulario.Ativo,
            formulario.VersaoPublicadaId,
            formulario.CriadoEm,
            formulario.AtualizadoEm);
    }

    public static VersaoFormularioResumoDto ParaResumoDto(this VersaoFormulario versao)
    {
        return new VersaoFormularioResumoDto(
            versao.Id,
            versao.FormularioId,
            versao.NumeroVersao,
            versao.StatusPublicacao,
            versao.CriadoEm,
            versao.PublicadoEm,
            versao.ObterSchema());
    }

    public static FormularioDetalheDto ParaDetalheDto(this Formulario formulario)
    {
        return new FormularioDetalheDto(
            formulario.Id,
            formulario.Titulo,
            formulario.Descricao,
            formulario.Chave,
            formulario.Arquivado,
            formulario.Ativo,
            formulario.VersaoPublicadaId,
            formulario.Versoes
                .OrderByDescending(x => x.NumeroVersao)
                .Select(x => x.ParaResumoDto())
                .ToArray(),
            formulario.CriadoEm,
            formulario.AtualizadoEm);
    }

    public static TipoCampoCatalogoDto ParaDto(this TipoCampoCatalogo tipoCampo)
    {
        return new TipoCampoCatalogoDto(
            tipoCampo.Id,
            tipoCampo.Nome,
            tipoCampo.Descricao,
            tipoCampo.AceitaOpcoes,
            tipoCampo.AceitaMascara,
            tipoCampo.AceitaValidacoes);
    }

    public static SubmissaoDto ParaDto(this SubmissaoFormulario submissao)
    {
        return new SubmissaoDto(
            submissao.Id,
            submissao.FormularioId,
            submissao.VersaoFormularioId,
            submissao.Status,
            submissao.DadosRespostaJson,
            submissao.MetadadosJson,
            submissao.CriadoPor,
            submissao.CriadoEm);
    }
}