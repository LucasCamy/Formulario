using FormularioDinamico.Modulos.Formularios.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.Dtos;

public sealed record UsuarioDto(
    Guid Id,
    string Nome,
    string Email,
    bool EhAdmin,
    DateTimeOffset CriadoEm);

public sealed record LoginRespostaDto(
    string Token,
    UsuarioDto Usuario);

public static class MapeadorDtosUsuarios
{
    public static UsuarioDto ParaDto(this Usuario usuario)
    {
        return new UsuarioDto(
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.EhAdmin,
            usuario.CriadoEm);
    }
}
