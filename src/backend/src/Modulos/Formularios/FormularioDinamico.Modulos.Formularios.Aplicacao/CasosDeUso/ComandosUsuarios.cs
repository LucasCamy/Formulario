using FluentValidation;
using FormularioDinamico.BuildingBlocks.Aplicacao;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Dtos;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;

// ── Login ──────────────────────────────────────────────

public sealed record LoginCommand(string Email, string Senha) : IComando<LoginRespostaDto>;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty();
    }
}

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginRespostaDto>
{
    private readonly IRepositorioUsuario _repositorioUsuario;
    private readonly IServicoAutenticacao _servicoAutenticacao;

    public LoginCommandHandler(IRepositorioUsuario repositorioUsuario, IServicoAutenticacao servicoAutenticacao)
    {
        _repositorioUsuario = repositorioUsuario;
        _servicoAutenticacao = servicoAutenticacao;
    }

    public async ValueTask<LoginRespostaDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _repositorioUsuario.ObterPorEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken)
            ?? throw new InvalidOperationException("Credenciais inválidas.");

        if (!_servicoAutenticacao.VerificarSenha(request.Senha, usuario.SenhaHash))
            throw new InvalidOperationException("Credenciais inválidas.");

        var token = _servicoAutenticacao.GerarToken(usuario.Id, usuario.Email, usuario.Nome, usuario.EhAdmin);

        return new LoginRespostaDto(token, usuario.ParaDto());
    }
}

// ── Criar usuário ──────────────────────────────────────

public sealed record CriarUsuarioCommand(string Nome, string Email, string Senha, bool EhAdmin) : IComando<UsuarioDto>;

public sealed class CriarUsuarioCommandValidator : AbstractValidator<CriarUsuarioCommand>
{
    public CriarUsuarioCommandValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(6).MaximumLength(100);
    }
}

public sealed class CriarUsuarioCommandHandler : IRequestHandler<CriarUsuarioCommand, UsuarioDto>
{
    private readonly IRepositorioUsuario _repositorioUsuario;
    private readonly IServicoAutenticacao _servicoAutenticacao;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public CriarUsuarioCommandHandler(
        IRepositorioUsuario repositorioUsuario,
        IServicoAutenticacao servicoAutenticacao,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioUsuario = repositorioUsuario;
        _servicoAutenticacao = servicoAutenticacao;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<UsuarioDto> Handle(CriarUsuarioCommand request, CancellationToken cancellationToken)
    {
        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var existente = await _repositorioUsuario.ObterPorEmailAsync(emailNormalizado, cancellationToken);
        if (existente is not null)
            throw new InvalidOperationException("Já existe um usuário com este e-mail.");

        var senhaHash = _servicoAutenticacao.GerarHashSenha(request.Senha);
        var usuario = Dominio.Usuario.Criar(request.Nome, emailNormalizado, senhaHash, request.EhAdmin);

        _repositorioUsuario.Adicionar(usuario);
        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return usuario.ParaDto();
    }
}

// ── Atualizar usuário ──────────────────────────────────

public sealed record AtualizarUsuarioCommand(Guid UsuarioId, string Nome, string Email, bool EhAdmin, string? NovaSenha) : IComando<UsuarioDto>;

public sealed class AtualizarUsuarioCommandValidator : AbstractValidator<AtualizarUsuarioCommand>
{
    public AtualizarUsuarioCommandValidator()
    {
        RuleFor(x => x.UsuarioId).NotEmpty();
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.NovaSenha).MinimumLength(6).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.NovaSenha));
    }
}

public sealed class AtualizarUsuarioCommandHandler : IRequestHandler<AtualizarUsuarioCommand, UsuarioDto>
{
    private readonly IRepositorioUsuario _repositorioUsuario;
    private readonly IServicoAutenticacao _servicoAutenticacao;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public AtualizarUsuarioCommandHandler(
        IRepositorioUsuario repositorioUsuario,
        IServicoAutenticacao servicoAutenticacao,
        IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioUsuario = repositorioUsuario;
        _servicoAutenticacao = servicoAutenticacao;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<UsuarioDto> Handle(AtualizarUsuarioCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _repositorioUsuario.ObterPorIdAsync(request.UsuarioId, cancellationToken)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        usuario.Atualizar(request.Nome, request.Email, request.EhAdmin);

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            var novoHash = _servicoAutenticacao.GerarHashSenha(request.NovaSenha);
            usuario.AlterarSenha(novoHash);
        }

        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return usuario.ParaDto();
    }
}

// ── Remover usuário ────────────────────────────────────

public sealed record RemoverUsuarioCommand(Guid UsuarioId) : IComando<bool>;

public sealed class RemoverUsuarioCommandHandler : IRequestHandler<RemoverUsuarioCommand, bool>
{
    private readonly IRepositorioUsuario _repositorioUsuario;
    private readonly IUnidadeTrabalhoFormularios _unidadeTrabalho;

    public RemoverUsuarioCommandHandler(IRepositorioUsuario repositorioUsuario, IUnidadeTrabalhoFormularios unidadeTrabalho)
    {
        _repositorioUsuario = repositorioUsuario;
        _unidadeTrabalho = unidadeTrabalho;
    }

    public async ValueTask<bool> Handle(RemoverUsuarioCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _repositorioUsuario.ObterPorIdAsync(request.UsuarioId, cancellationToken)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        _repositorioUsuario.Remover(usuario);
        await _unidadeTrabalho.SaveChangesAsync(cancellationToken);

        return true;
    }
}

// ── Listar usuários ────────────────────────────────────

public sealed record ListarUsuariosQuery() : IConsulta<IReadOnlyCollection<UsuarioDto>>;

public sealed class ListarUsuariosQueryHandler : IRequestHandler<ListarUsuariosQuery, IReadOnlyCollection<UsuarioDto>>
{
    private readonly IRepositorioUsuario _repositorioUsuario;

    public ListarUsuariosQueryHandler(IRepositorioUsuario repositorioUsuario)
    {
        _repositorioUsuario = repositorioUsuario;
    }

    public async ValueTask<IReadOnlyCollection<UsuarioDto>> Handle(ListarUsuariosQuery request, CancellationToken cancellationToken)
    {
        var usuarios = await _repositorioUsuario.ListarAsync(cancellationToken);
        return usuarios.Select(u => u.ParaDto()).ToArray();
    }
}
