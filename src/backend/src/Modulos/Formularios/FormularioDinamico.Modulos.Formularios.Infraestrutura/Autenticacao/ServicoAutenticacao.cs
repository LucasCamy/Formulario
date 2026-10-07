using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Autenticacao;

public sealed class ServicoAutenticacao : IServicoAutenticacao
{
    private readonly IConfiguration _configuration;

    public ServicoAutenticacao(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GerarHashSenha(string senha)
    {
        return BCrypt.Net.BCrypt.HashPassword(senha, workFactor: 12);
    }

    public bool VerificarSenha(string senha, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(senha, hash);
    }

    public string GerarToken(Guid userId, string email, string nome, bool ehAdmin)
    {
        var chaveSecreta = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("Jwt:Secret não configurado.");

        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveSecreta));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new("nome", nome),
            new(ClaimTypes.Role, ehAdmin ? "Admin" : "Usuario"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var expiracao = int.TryParse(_configuration["Jwt:ExpiracaoHoras"], out var horas)
            ? TimeSpan.FromHours(horas)
            : TimeSpan.FromHours(8);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Emissor"] ?? "FormularioDinamico",
            audience: _configuration["Jwt:Audiencia"] ?? "FormularioDinamico",
            claims: claims,
            expires: DateTime.UtcNow.Add(expiracao),
            signingCredentials: credenciais);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
