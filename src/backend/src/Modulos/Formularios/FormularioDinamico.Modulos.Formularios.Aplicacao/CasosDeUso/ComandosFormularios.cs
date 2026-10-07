using System.Text.Json;
using FluentValidation;
using FormularioDinamico.BuildingBlocks.Aplicacao;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Dtos;
using FormularioDinamico.Modulos.Formularios.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;

public sealed record CriarFormularioCommand(string Titulo, string? Descricao, string Chave, string CriadoPor) : IComando<FormularioResumoDto>;

public sealed class CriarFormularioCommandValidator : AbstractValidator<CriarFormularioCommand>
{
    public CriarFormularioCommandValidator()
    {
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Chave).NotEmpty().Matches("^[a-z0-9-]+$").WithMessage("A chave deve conter apenas letras minúsculas, números e hífen.");
        RuleFor(x => x.CriadoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class CriarFormularioCommandHandler : IRequestHandler<CriarFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public CriarFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(CriarFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = Formulario.Criar(request.Titulo, request.Descricao, request.Chave, request.CriadoPor);
        _repositorioFormulario.Adicionar(formulario);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "Criacao",
            nameof(Formulario),
            formulario.Id.ToString(),
            request.CriadoPor,
            new { formulario.Titulo, formulario.Chave }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

public sealed record CriarVersaoRascunhoCommand(Guid FormularioId, string CriadoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class CriarVersaoRascunhoCommandValidator : AbstractValidator<CriarVersaoRascunhoCommand>
{
    public CriarVersaoRascunhoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.CriadoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class CriarVersaoRascunhoCommandHandler : IRequestHandler<CriarVersaoRascunhoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public CriarVersaoRascunhoCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(CriarVersaoRascunhoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.CriarVersaoRascunho(request.CriadoPor);
        _repositorioFormulario.AdicionarVersao(versao);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "CriacaoVersao",
            nameof(VersaoFormulario),
            versao.Id.ToString(),
            request.CriadoPor,
            new { versao.NumeroVersao, formulario.Id }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return versao.ParaResumoDto();
    }
}

public sealed record AdicionarCampoCommand(
    Guid FormularioId,
    Guid VersaoId,
    Guid? SecaoId,
    string Chave,
    string Rotulo,
    string? Descricao,
    TipoCampo Tipo,
    bool Obrigatorio,
    string? Placeholder,
    string? Mascara,
    int Ordem,
    ValidacoesCampoSchema? Validacoes,
    RegraVisibilidadeSchema? Visibilidade,
    RegraRepeticaoSchema? Repeticao,
    IReadOnlyCollection<OpcaoCampoSchema>? Opcoes,
    bool ValorUnico,
    string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class AdicionarCampoCommandValidator : AbstractValidator<AdicionarCampoCommand>
{
    public AdicionarCampoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.Chave).NotEmpty().Matches("^[a-z0-9-]+$");
        RuleFor(x => x.Rotulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class AdicionarCampoCommandHandler : IRequestHandler<AdicionarCampoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public AdicionarCampoCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(AdicionarCampoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);

        var campo = new CampoFormularioSchema
        {
            Chave = request.Chave,
            Rotulo = request.Rotulo,
            Descricao = request.Descricao,
            Tipo = request.Tipo,
            Obrigatorio = request.Obrigatorio,
            ValorUnico = request.ValorUnico,
            Placeholder = request.Placeholder,
            Mascara = request.Mascara,
            Ordem = request.Ordem,
            Validacoes = request.Validacoes ?? new ValidacoesCampoSchema(),
            Visibilidade = request.Visibilidade,
            Repeticao = request.Repeticao,
            Opcoes = request.Opcoes?.ToList() ?? [],
        };

        versao.AdicionarCampo(campo, request.SecaoId);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "AdicaoCampo",
            nameof(VersaoFormulario),
            versao.Id.ToString(),
            request.AlteradoPor,
            new { campo.Chave, campo.Rotulo, campo.Tipo }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return versao.ParaResumoDto();
    }
}

public sealed record PublicarVersaoFormularioCommand(Guid FormularioId, Guid VersaoId, string PublicadoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class PublicarVersaoFormularioCommandValidator : AbstractValidator<PublicarVersaoFormularioCommand>
{
    public PublicarVersaoFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.PublicadoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class PublicarVersaoFormularioCommandHandler : IRequestHandler<PublicarVersaoFormularioCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public PublicarVersaoFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(PublicarVersaoFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.PublicarVersao(request.VersaoId, request.PublicadoPor);
        var versao = formulario.ObterVersao(request.VersaoId);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "PublicacaoVersao",
            nameof(VersaoFormulario),
            versao.Id.ToString(),
            request.PublicadoPor,
            new { versao.NumeroVersao, formulario.Id }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return versao.ParaResumoDto();
    }
}

public sealed record SubmeterRespostaFormularioCommand(Guid FormularioId, JsonElement DadosResposta, JsonElement? Metadados, string CriadoPor) : IComando<SubmissaoDto>;

public sealed class SubmeterRespostaFormularioCommandValidator : AbstractValidator<SubmeterRespostaFormularioCommand>
{
    public SubmeterRespostaFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.CriadoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class SubmeterRespostaFormularioCommandHandler : IRequestHandler<SubmeterRespostaFormularioCommand, SubmissaoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioSubmissao _repositorioSubmissao;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public SubmeterRespostaFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioSubmissao repositorioSubmissao,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioSubmissao = repositorioSubmissao;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<SubmissaoDto> Handle(SubmeterRespostaFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        if (!formulario.Ativo)
        {
            throw new InvalidOperationException("Formulário desativado e não está disponível para preenchimento.");
        }

        var versaoPublicada = await _repositorioFormulario.ObterVersaoPublicadaAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Não existe versão publicada para este formulário.");

        var schema = versaoPublicada.ObterSchema();
        var dadosRespostaJson = request.DadosResposta.GetRawText();
        var metadadosJson = request.Metadados?.GetRawText();

        ValidarCamposObrigatorios(schema, request.DadosResposta);
        await ValidarCamposUnicosAsync(schema, request.FormularioId, request.DadosResposta, cancellationToken);

        var submissao = SubmissaoFormulario.Criar(
            request.FormularioId,
            versaoPublicada.Id,
            dadosRespostaJson,
            metadadosJson,
            request.CriadoPor);

        _repositorioSubmissao.Adicionar(submissao);
        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "SubmissaoFormulario",
            nameof(SubmissaoFormulario),
            submissao.Id.ToString(),
            request.CriadoPor,
            new { submissao.FormularioId, submissao.VersaoFormularioId }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return submissao.ParaDto();
    }

    private static void ValidarCamposObrigatorios(SchemaFormulario schema, JsonElement dadosResposta)
    {
        if (dadosResposta.ValueKind != JsonValueKind.Object)
        {
            throw new InvalidOperationException("O payload de respostas deve ser um objeto JSON.");
        }

        var respostas = dadosResposta.EnumerateObject().ToDictionary(x => x.Name, x => x.Value, StringComparer.OrdinalIgnoreCase);

        var camposObrigatorios = schema.Secoes
            .SelectMany(x => x.Campos)
            .Where(x => x.Obrigatorio)
            .ToList();

        var faltantes = new List<string>();

        foreach (var campo in camposObrigatorios)
        {
            // Campos com repetição são enviados como chave__1, chave__2...
            // Só validam se houver ao menos uma instância preenchida
            if (campo.Repeticao is not null)
            {
                var instancias = respostas
                    .Where(kv => kv.Key.StartsWith(campo.Chave + "__", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var (chaveInstancia, valorInstancia) in instancias)
                {
                    if (valorInstancia.ValueKind == JsonValueKind.Null ||
                        (valorInstancia.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(valorInstancia.GetString())))
                    {
                        faltantes.Add(chaveInstancia);
                    }
                }
                continue;
            }

            if (!respostas.TryGetValue(campo.Chave, out var valor))
            {
                faltantes.Add(campo.Chave);
                continue;
            }

            if (valor.ValueKind == JsonValueKind.Null)
            {
                faltantes.Add(campo.Chave);
                continue;
            }

            if (valor.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(valor.GetString()))
            {
                faltantes.Add(campo.Chave);
            }
        }

        if (faltantes.Count != 0)
        {
            throw new InvalidOperationException($"Campos obrigatórios ausentes: {string.Join(", ", faltantes)}.");
        }
    }

    private async Task ValidarCamposUnicosAsync(SchemaFormulario schema, Guid formularioId, JsonElement dadosResposta, CancellationToken cancellationToken)
    {
        var respostas = dadosResposta.EnumerateObject().ToDictionary(x => x.Name, x => x.Value, StringComparer.OrdinalIgnoreCase);

        // Campos com Repeticao coletam múltiplos valores por instância (chave__1, chave__2...).
        // Não faz sentido semântico exigir unicidade global por instância nesses casos.
        var camposUnicos = schema.Secoes
            .SelectMany(x => x.Campos)
            .Where(x => x.ValorUnico && x.Repeticao is null)
            .ToList();

        foreach (var campo in camposUnicos)
        {
            if (!respostas.TryGetValue(campo.Chave, out var valor)) continue;
            if (valor.ValueKind == JsonValueKind.Null) continue;

            var valorTexto = valor.ValueKind == JsonValueKind.String
                ? valor.GetString() ?? string.Empty
                : valor.GetRawText();

            if (string.IsNullOrWhiteSpace(valorTexto)) continue;

            var existe = await _repositorioSubmissao.ExisteSubmissaoComValorAsync(formularioId, campo.Chave, valorTexto, cancellationToken);
            if (existe)
            {
                throw new InvalidOperationException($"Já existe um cadastro com o valor informado para o campo '{campo.Rotulo}'.");
            }
        }
    }
}

public sealed record ArquivarFormularioCommand(Guid FormularioId, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class ArquivarFormularioCommandValidator : AbstractValidator<ArquivarFormularioCommand>
{
    public ArquivarFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class ArquivarFormularioCommandHandler : IRequestHandler<ArquivarFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public ArquivarFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(ArquivarFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.Arquivar(request.AlteradoPor);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "ArquivamentoFormulario",
            nameof(Formulario),
            formulario.Id.ToString(),
            request.AlteradoPor,
            null));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Adicionar seção ────────────────────────────────────

public sealed record AdicionarSecaoCommand(
    Guid FormularioId,
    Guid VersaoId,
    string Titulo,
    string? Descricao,
    string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class AdicionarSecaoCommandValidator : AbstractValidator<AdicionarSecaoCommand>
{
    public AdicionarSecaoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class AdicionarSecaoCommandHandler : IRequestHandler<AdicionarSecaoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public AdicionarSecaoCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(AdicionarSecaoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.AdicionarSecao(request.Titulo, request.Descricao);

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return versao.ParaResumoDto();
    }
}

// ── Editar formulário ──────────────────────────────────

public sealed record EditarFormularioCommand(Guid FormularioId, string Titulo, string? Descricao, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class EditarFormularioCommandValidator : AbstractValidator<EditarFormularioCommand>
{
    public EditarFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class EditarFormularioCommandHandler : IRequestHandler<EditarFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public EditarFormularioCommandHandler(IRepositorioFormulario repositorioFormulario, IRepositorioAuditoria repositorioAuditoria, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(EditarFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.Atualizar(request.Titulo, request.Descricao);

        foreach (var versao in formulario.Versoes)
        {
            versao.AtualizarMetadados(request.Titulo, request.Descricao);
        }

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar("EdicaoFormulario", nameof(Formulario), formulario.Id.ToString(), request.AlteradoPor, new { formulario.Titulo }));
        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Excluir formulário (soft-delete) ───────────────────

public sealed record ExcluirFormularioCommand(Guid FormularioId, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class ExcluirFormularioCommandValidator : AbstractValidator<ExcluirFormularioCommand>
{
    public ExcluirFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class ExcluirFormularioCommandHandler : IRequestHandler<ExcluirFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public ExcluirFormularioCommandHandler(IRepositorioFormulario repositorioFormulario, IRepositorioAuditoria repositorioAuditoria, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(ExcluirFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.Excluir();

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar("ExclusaoFormulario", nameof(Formulario), formulario.Id.ToString(), request.AlteradoPor, null));
        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Editar seção ───────────────────────────────────────

public sealed record EditarSecaoCommand(Guid FormularioId, Guid VersaoId, Guid SecaoId, string Titulo, string? Descricao, string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class EditarSecaoCommandValidator : AbstractValidator<EditarSecaoCommand>
{
    public EditarSecaoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.SecaoId).NotEmpty();
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class EditarSecaoCommandHandler : IRequestHandler<EditarSecaoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public EditarSecaoCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(EditarSecaoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.EditarSecao(request.SecaoId, request.Titulo, request.Descricao);

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}

// ── Remover seção ──────────────────────────────────────

public sealed record RemoverSecaoCommand(Guid FormularioId, Guid VersaoId, Guid SecaoId, string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class RemoverSecaoCommandValidator : AbstractValidator<RemoverSecaoCommand>
{
    public RemoverSecaoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.SecaoId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class RemoverSecaoCommandHandler : IRequestHandler<RemoverSecaoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public RemoverSecaoCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(RemoverSecaoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.RemoverSecao(request.SecaoId);

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}

// ── Editar campo ───────────────────────────────────────

public sealed record EditarCampoCommand(
    Guid FormularioId, Guid VersaoId, Guid SecaoId, Guid CampoId,
    string Rotulo, string? Descricao, string? Placeholder, string? Mascara,
    bool Obrigatorio, bool ValorUnico, IReadOnlyCollection<OpcaoCampoSchema>? Opcoes,
    RegraRepeticaoSchema? Repeticao,
    string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class EditarCampoCommandValidator : AbstractValidator<EditarCampoCommand>
{
    public EditarCampoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.SecaoId).NotEmpty();
        RuleFor(x => x.CampoId).NotEmpty();
        RuleFor(x => x.Rotulo).NotEmpty().MaximumLength(160);
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class EditarCampoCommandHandler : IRequestHandler<EditarCampoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public EditarCampoCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(EditarCampoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.EditarCampo(request.SecaoId, request.CampoId, request.Rotulo, request.Descricao, request.Placeholder, request.Mascara, request.Obrigatorio, request.ValorUnico, request.Opcoes, request.Repeticao);

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}

// ── Remover campo ──────────────────────────────────────

public sealed record RemoverCampoCommand(Guid FormularioId, Guid VersaoId, Guid SecaoId, Guid CampoId, string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class RemoverCampoCommandValidator : AbstractValidator<RemoverCampoCommand>
{
    public RemoverCampoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.SecaoId).NotEmpty();
        RuleFor(x => x.CampoId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class RemoverCampoCommandHandler : IRequestHandler<RemoverCampoCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public RemoverCampoCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(RemoverCampoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.RemoverCampo(request.SecaoId, request.CampoId);

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}

// ── Remover versão ─────────────────────────────────────

public sealed record RemoverVersaoCommand(Guid FormularioId, Guid VersaoId, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class RemoverVersaoCommandValidator : AbstractValidator<RemoverVersaoCommand>
{
    public RemoverVersaoCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class RemoverVersaoCommandHandler : IRequestHandler<RemoverVersaoCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public RemoverVersaoCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(RemoverVersaoCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        formulario.RemoverVersao(request.VersaoId);
        _repositorioFormulario.RemoverVersao(versao);

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "RemocaoVersao",
            nameof(VersaoFormulario),
            request.VersaoId.ToString(),
            request.AlteradoPor,
            new { formulario.Id, VersaoId = request.VersaoId }));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Desativar formulário ───────────────────────────────

public sealed record DesativarFormularioCommand(Guid FormularioId, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class DesativarFormularioCommandValidator : AbstractValidator<DesativarFormularioCommand>
{
    public DesativarFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class DesativarFormularioCommandHandler : IRequestHandler<DesativarFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public DesativarFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(DesativarFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.Desativar();

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "DesativacaoFormulario",
            nameof(Formulario),
            formulario.Id.ToString(),
            request.AlteradoPor,
            null));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Ativar formulário ──────────────────────────────────

public sealed record AtivarFormularioCommand(Guid FormularioId, string AlteradoPor) : IComando<FormularioResumoDto>;

public sealed class AtivarFormularioCommandValidator : AbstractValidator<AtivarFormularioCommand>
{
    public AtivarFormularioCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class AtivarFormularioCommandHandler : IRequestHandler<AtivarFormularioCommand, FormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioAuditoria _repositorioAuditoria;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public AtivarFormularioCommandHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioAuditoria repositorioAuditoria,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioAuditoria = repositorioAuditoria;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<FormularioResumoDto> Handle(AtivarFormularioCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.Ativar();

        _repositorioAuditoria.Adicionar(RegistroAuditoria.Criar(
            "AtivacaoFormulario",
            nameof(Formulario),
            formulario.Id.ToString(),
            request.AlteradoPor,
            null));

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return formulario.ParaResumoDto();
    }
}

// ── Reordenar campos ───────────────────────────────────

public sealed record SecaoOrdemDto(Guid SecaoId, int Ordem);

public sealed record ReordenarSecoesCommand(
    Guid FormularioId, Guid VersaoId,
    IReadOnlyCollection<SecaoOrdemDto> Secoes,
    string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class ReordenarSecoesCommandValidator : AbstractValidator<ReordenarSecoesCommand>
{
    public ReordenarSecoesCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.Secoes).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class ReordenarSecoesCommandHandler : IRequestHandler<ReordenarSecoesCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public ReordenarSecoesCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(ReordenarSecoesCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.ReordenarSecoes(request.Secoes.Select(s => (s.SecaoId, s.Ordem)).ToArray());

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}

public sealed record CampoOrdemDto(Guid CampoId, int Ordem, int LarguraColunas);

public sealed record ReordenarCamposCommand(
    Guid FormularioId, Guid VersaoId, Guid SecaoId,
    IReadOnlyCollection<CampoOrdemDto> Campos,
    string AlteradoPor) : IComando<VersaoFormularioResumoDto>;

public sealed class ReordenarCamposCommandValidator : AbstractValidator<ReordenarCamposCommand>
{
    public ReordenarCamposCommandValidator()
    {
        RuleFor(x => x.FormularioId).NotEmpty();
        RuleFor(x => x.VersaoId).NotEmpty();
        RuleFor(x => x.SecaoId).NotEmpty();
        RuleFor(x => x.Campos).NotEmpty();
        RuleFor(x => x.AlteradoPor).NotEmpty().MaximumLength(120);
    }
}

public sealed class ReordenarCamposCommandHandler : IRequestHandler<ReordenarCamposCommand, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public ReordenarCamposCommandHandler(IRepositorioFormulario repositorioFormulario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioFormulario = repositorioFormulario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(ReordenarCamposCommand request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versao = formulario.ObterVersao(request.VersaoId);
        versao.ReordenarCampos(request.SecaoId, request.Campos.Select(c => (c.CampoId, c.Ordem, c.LarguraColunas)).ToArray());

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);
        return versao.ParaResumoDto();
    }
}