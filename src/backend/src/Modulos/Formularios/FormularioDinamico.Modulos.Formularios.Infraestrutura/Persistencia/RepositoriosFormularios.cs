using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Dominio;
using Microsoft.EntityFrameworkCore;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;

public sealed class RepositorioFormulario : IRepositorioFormulario
{
    private readonly ContextoFormulariosDb _contexto;

    public RepositorioFormulario(ContextoFormulariosDb contexto)
    {
        _contexto = contexto;
    }

    public void Adicionar(Formulario formulario)
    {
        _contexto.Formularios.Add(formulario);
    }

    public void AdicionarVersao(VersaoFormulario versao)
    {
        _contexto.VersoesFormulario.Add(versao);
    }

    public void RemoverVersao(VersaoFormulario versao)
    {
        _contexto.VersoesFormulario.Remove(versao);
    }

    public async Task<IReadOnlyCollection<Formulario>> ListarAsync(CancellationToken cancellationToken)
    {
        return await _contexto.Formularios
            .Include(x => x.Versoes)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Formulario?> ObterPorIdAsync(Guid formularioId, CancellationToken cancellationToken)
    {
        return await _contexto.Formularios
            .Include(x => x.Versoes)
            .FirstOrDefaultAsync(x => x.Id == formularioId, cancellationToken);
    }

    public async Task<Formulario?> ObterPorChaveAsync(string chave, CancellationToken cancellationToken)
    {
        return await _contexto.Formularios
            .Include(x => x.Versoes)
            .FirstOrDefaultAsync(x => x.Chave == chave.ToLowerInvariant(), cancellationToken);
    }

    public async Task<VersaoFormulario?> ObterVersaoAsync(Guid formularioId, Guid versaoId, CancellationToken cancellationToken)
    {
        return await _contexto.VersoesFormulario
            .FirstOrDefaultAsync(x => x.FormularioId == formularioId && x.Id == versaoId, cancellationToken);
    }

    public async Task<VersaoFormulario?> ObterVersaoPublicadaAsync(Guid formularioId, CancellationToken cancellationToken)
    {
        return await _contexto.VersoesFormulario
            .AsNoTracking()
            .Where(x => x.FormularioId == formularioId && x.StatusPublicacao == StatusPublicacaoVersao.Publicada)
            .OrderByDescending(x => x.NumeroVersao)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

public sealed class RepositorioSubmissao : IRepositorioSubmissao
{
    private readonly ContextoFormulariosDb _contexto;

    public RepositorioSubmissao(ContextoFormulariosDb contexto)
    {
        _contexto = contexto;
    }

    public void Adicionar(SubmissaoFormulario submissao)
    {
        _contexto.SubmissoesFormulario.Add(submissao);
    }

    public async Task<SubmissaoFormulario?> ObterPorIdAsync(Guid submissaoId, CancellationToken cancellationToken)
    {
        return await _contexto.SubmissoesFormulario
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == submissaoId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<SubmissaoFormulario>> ListarPorVersaoAsync(Guid versaoId, CancellationToken cancellationToken)
    {
        return await _contexto.SubmissoesFormulario
            .AsNoTracking()
            .Where(x => x.VersaoFormularioId == versaoId)
            .OrderByDescending(x => x.CriadoEm)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExisteSubmissaoComValorAsync(Guid formularioId, string chaveCampo, string valor, CancellationToken cancellationToken)
    {
        return await _contexto.Database
            .SqlQuery<bool>(
                $"""SELECT EXISTS(SELECT 1 FROM submissoes_formulario WHERE "FormularioId" = {formularioId} AND "DadosRespostaJson" ->> {chaveCampo} = {valor}) AS "Value" """)
            .SingleAsync(cancellationToken);
    }
}

public sealed class RepositorioCatalogoTipoCampo : IRepositorioCatalogoTipoCampo
{
    private readonly ContextoFormulariosDb _contexto;

    public RepositorioCatalogoTipoCampo(ContextoFormulariosDb contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyCollection<TipoCampoCatalogo>> ListarAsync(CancellationToken cancellationToken)
    {
        return await _contexto.CatalogoTiposCampo
            .AsNoTracking()
            .OrderBy(x => x.Nome)
            .ToListAsync(cancellationToken);
    }
}

public sealed class RepositorioAuditoria : IRepositorioAuditoria
{
    private readonly ContextoFormulariosDb _contexto;

    public RepositorioAuditoria(ContextoFormulariosDb contexto)
    {
        _contexto = contexto;
    }

    public void Adicionar(RegistroAuditoria registro)
    {
        _contexto.RegistrosAuditoria.Add(registro);
    }
}

public sealed class RepositorioUsuario : IRepositorioUsuario
{
    private readonly ContextoFormulariosDb _contexto;

    public RepositorioUsuario(ContextoFormulariosDb contexto)
    {
        _contexto = contexto;
    }

    public void Adicionar(Usuario usuario)
    {
        _contexto.Usuarios.Add(usuario);
    }

    public void Remover(Usuario usuario)
    {
        _contexto.Usuarios.Remove(usuario);
    }

    public async Task<IReadOnlyCollection<Usuario>> ListarAsync(CancellationToken cancellationToken)
    {
        return await _contexto.Usuarios
            .AsNoTracking()
            .OrderBy(x => x.Nome)
            .ToListAsync(cancellationToken);
    }

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await _contexto.Usuarios
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public async Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _contexto.Usuarios
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }
}
