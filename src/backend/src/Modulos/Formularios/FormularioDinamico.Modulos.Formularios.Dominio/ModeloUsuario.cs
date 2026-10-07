using FormularioDinamico.BuildingBlocks.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Dominio;

public sealed class Usuario : EntidadeBase<Guid>
{
    private Usuario()
    {
    }

    public string Nome { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string SenhaHash { get; private set; } = string.Empty;

    public bool EhAdmin { get; private set; }

    public DateTimeOffset CriadoEm { get; private set; }

    public static Usuario Criar(string nome, string email, string senhaHash, bool ehAdmin)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new InvalidOperationException("O nome do usuário é obrigatório.");

        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("O e-mail do usuário é obrigatório.");

        return new Usuario
        {
            Id = Guid.NewGuid(),
            Nome = nome.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            SenhaHash = senhaHash,
            EhAdmin = ehAdmin,
            CriadoEm = DateTimeOffset.UtcNow,
        };
    }

    public void Atualizar(string nome, string email, bool ehAdmin)
    {
        Nome = nome.Trim();
        Email = email.Trim().ToLowerInvariant();
        EhAdmin = ehAdmin;
    }

    public void AlterarSenha(string novaSenhaHash)
    {
        SenhaHash = novaSenhaHash;
    }
}
