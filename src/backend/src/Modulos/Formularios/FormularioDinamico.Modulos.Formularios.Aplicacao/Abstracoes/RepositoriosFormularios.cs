using FormularioDinamico.Modulos.Formularios.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;

public interface IRepositorioFormulario
{
    Task<Formulario?> ObterPorIdAsync(Guid formularioId, CancellationToken cancellationToken);

    Task<Formulario?> ObterPorChaveAsync(string chave, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Formulario>> ListarAsync(CancellationToken cancellationToken);

    Task<VersaoFormulario?> ObterVersaoPublicadaAsync(Guid formularioId, CancellationToken cancellationToken);

    Task<VersaoFormulario?> ObterVersaoAsync(Guid formularioId, Guid versaoId, CancellationToken cancellationToken);

    void Adicionar(Formulario formulario);

    void AdicionarVersao(VersaoFormulario versao);

    void RemoverVersao(VersaoFormulario versao);
}

public interface IRepositorioSubmissao
{
    Task<SubmissaoFormulario?> ObterPorIdAsync(Guid submissaoId, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<SubmissaoFormulario>> ListarPorVersaoAsync(Guid versaoId, CancellationToken cancellationToken);

    Task<bool> ExisteSubmissaoComValorAsync(Guid formularioId, string chaveCampo, string valor, CancellationToken cancellationToken);

    void Adicionar(SubmissaoFormulario submissao);
}

public interface IRepositorioCatalogoTipoCampo
{
    Task<IReadOnlyCollection<TipoCampoCatalogo>> ListarAsync(CancellationToken cancellationToken);
}

public interface IRepositorioAuditoria
{
    void Adicionar(RegistroAuditoria registro);
}

public interface IRepositorioUsuario
{
    Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Usuario>> ListarAsync(CancellationToken cancellationToken);

    void Adicionar(Usuario usuario);

    void Remover(Usuario usuario);
}

public interface IServicoAutenticacao
{
    string GerarHashSenha(string senha);

    bool VerificarSenha(string senha, string hash);

    string GerarToken(Guid userId, string email, string nome, bool ehAdmin);
}

public interface IUnidadeTrabalhoFormularios
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}