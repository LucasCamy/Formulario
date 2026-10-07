using FormularioDinamico.BuildingBlocks.Aplicacao;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Dtos;
using FormularioDinamico.Modulos.Formularios.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;

public sealed record ObterFormularioPorIdQuery(Guid FormularioId) : IConsulta<FormularioDetalheDto>;

public sealed class ObterFormularioPorIdQueryHandler : IRequestHandler<ObterFormularioPorIdQuery, FormularioDetalheDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;

    public ObterFormularioPorIdQueryHandler(IRepositorioFormulario repositorioFormulario)
    {
        _repositorioFormulario = repositorioFormulario;
    }

    public async ValueTask<FormularioDetalheDto> Handle(ObterFormularioPorIdQuery request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        return formulario.ParaDetalheDto();
    }
}

public sealed record ObterVersaoPublicadaFormularioQuery(Guid FormularioId) : IConsulta<VersaoFormularioResumoDto>;

public sealed class ObterVersaoPublicadaFormularioQueryHandler : IRequestHandler<ObterVersaoPublicadaFormularioQuery, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;

    public ObterVersaoPublicadaFormularioQueryHandler(IRepositorioFormulario repositorioFormulario)
    {
        _repositorioFormulario = repositorioFormulario;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(ObterVersaoPublicadaFormularioQuery request, CancellationToken cancellationToken)
    {
        var versao = await _repositorioFormulario.ObterVersaoPublicadaAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Versão publicada não encontrada.");

        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken);
        if (formulario is not null && !formulario.Ativo)
        {
            throw new InvalidOperationException("Formulário desativado e não está disponível para preenchimento.");
        }

        return versao.ParaResumoDto();
    }
}

public sealed record ObterBuilderFormularioQuery(Guid FormularioId) : IConsulta<BuilderFormularioDto>;

public sealed class ObterBuilderFormularioQueryHandler : IRequestHandler<ObterBuilderFormularioQuery, BuilderFormularioDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioCatalogoTipoCampo _repositorioCatalogoTipoCampo;

    public ObterBuilderFormularioQueryHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioCatalogoTipoCampo repositorioCatalogoTipoCampo)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioCatalogoTipoCampo = repositorioCatalogoTipoCampo;
    }

    public async ValueTask<BuilderFormularioDto> Handle(ObterBuilderFormularioQuery request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        var versaoEmEdicao = formulario.Versoes
            .Where(x => x.StatusPublicacao == StatusPublicacaoVersao.Rascunho)
            .OrderByDescending(x => x.NumeroVersao)
            .FirstOrDefault();

        var versaoPublicada = formulario.ObterVersaoPublicada();
        var tiposCampo = await _repositorioCatalogoTipoCampo.ListarAsync(cancellationToken);

        return new BuilderFormularioDto(
            formulario.ParaDetalheDto(),
            versaoEmEdicao?.ParaResumoDto(),
            versaoPublicada?.ParaResumoDto(),
            tiposCampo.Select(x => x.ParaDto()).ToArray());
    }
}

public sealed record ObterSubmissaoPorIdQuery(Guid SubmissaoId) : IConsulta<SubmissaoDto>;

public sealed class ObterSubmissaoPorIdQueryHandler : IRequestHandler<ObterSubmissaoPorIdQuery, SubmissaoDto>
{
    private readonly IRepositorioSubmissao _repositorioSubmissao;

    public ObterSubmissaoPorIdQueryHandler(IRepositorioSubmissao repositorioSubmissao)
    {
        _repositorioSubmissao = repositorioSubmissao;
    }

    public async ValueTask<SubmissaoDto> Handle(ObterSubmissaoPorIdQuery request, CancellationToken cancellationToken)
    {
        var submissao = await _repositorioSubmissao.ObterPorIdAsync(request.SubmissaoId, cancellationToken)
            ?? throw new InvalidOperationException("Submissão não encontrada.");

        return submissao.ParaDto();
    }
}

public sealed record ListarFormulariosQuery() : IConsulta<IReadOnlyCollection<FormularioResumoDto>>;

public sealed class ListarFormulariosQueryHandler : IRequestHandler<ListarFormulariosQuery, IReadOnlyCollection<FormularioResumoDto>>
{
    private readonly IRepositorioFormulario _repositorioFormulario;

    public ListarFormulariosQueryHandler(IRepositorioFormulario repositorioFormulario)
    {
        _repositorioFormulario = repositorioFormulario;
    }

    public async ValueTask<IReadOnlyCollection<FormularioResumoDto>> Handle(ListarFormulariosQuery request, CancellationToken cancellationToken)
    {
        var formularios = await _repositorioFormulario.ListarAsync(cancellationToken);

        return formularios
            .OrderByDescending(x => x.AtualizadoEm)
            .Select(x => x.ParaResumoDto())
            .ToArray();
    }
}

public sealed record ObterVersaoPublicadaPorChaveQuery(string Chave) : IConsulta<VersaoFormularioResumoDto>;

public sealed class ObterVersaoPublicadaPorChaveQueryHandler : IRequestHandler<ObterVersaoPublicadaPorChaveQuery, VersaoFormularioResumoDto>
{
    private readonly IRepositorioFormulario _repositorioFormulario;

    public ObterVersaoPublicadaPorChaveQueryHandler(IRepositorioFormulario repositorioFormulario)
    {
        _repositorioFormulario = repositorioFormulario;
    }

    public async ValueTask<VersaoFormularioResumoDto> Handle(ObterVersaoPublicadaPorChaveQuery request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorChaveAsync(request.Chave, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado para a chave informada.");

        if (!formulario.Ativo)
        {
            throw new InvalidOperationException("Formulário desativado e não está disponível para preenchimento.");
        }

        var versao = await _repositorioFormulario.ObterVersaoPublicadaAsync(formulario.Id, cancellationToken)
            ?? throw new InvalidOperationException("Versão publicada não encontrada.");

        return versao.ParaResumoDto();
    }
}

public sealed record ListarSubmissoesPorVersaoQuery(Guid FormularioId, Guid VersaoId) : IConsulta<IReadOnlyCollection<SubmissaoDto>>;

public sealed class ListarSubmissoesPorVersaoQueryHandler : IRequestHandler<ListarSubmissoesPorVersaoQuery, IReadOnlyCollection<SubmissaoDto>>
{
    private readonly IRepositorioFormulario _repositorioFormulario;
    private readonly IRepositorioSubmissao _repositorioSubmissao;

    public ListarSubmissoesPorVersaoQueryHandler(
        IRepositorioFormulario repositorioFormulario,
        IRepositorioSubmissao repositorioSubmissao)
    {
        _repositorioFormulario = repositorioFormulario;
        _repositorioSubmissao = repositorioSubmissao;
    }

    public async ValueTask<IReadOnlyCollection<SubmissaoDto>> Handle(ListarSubmissoesPorVersaoQuery request, CancellationToken cancellationToken)
    {
        var formulario = await _repositorioFormulario.ObterPorIdAsync(request.FormularioId, cancellationToken)
            ?? throw new InvalidOperationException("Formulário não encontrado.");

        formulario.ObterVersao(request.VersaoId);

        var submissoes = await _repositorioSubmissao.ListarPorVersaoAsync(request.VersaoId, cancellationToken);

        return submissoes.Select(s => s.ParaDto()).ToArray();
    }
}