using FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace FormularioDinamico.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AutenticacaoController : ControllerBase
{
    private readonly IMediator _sender;

    public AutenticacaoController(IMediator sender)
    {
        _sender = sender;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new LoginCommand(request.Email, request.Senha), cancellationToken);
        return Ok(resposta);
    }
}

public sealed record LoginRequest(string Email, string Senha);
