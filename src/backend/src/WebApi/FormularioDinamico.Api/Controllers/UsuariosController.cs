using FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormularioDinamico.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "Admin")]
public sealed class UsuariosController : ControllerBase
{
    private readonly IMediator _sender;

    public UsuariosController(IMediator sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ListarUsuariosQuery(), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new CriarUsuarioCommand(request.Nome, request.Email, request.Senha, request.EhAdmin), cancellationToken);
        return CreatedAtAction(nameof(Listar), new { id = resposta.Id }, resposta);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarUsuarioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new AtualizarUsuarioCommand(id, request.Nome, request.Email, request.EhAdmin, request.NovaSenha), cancellationToken);
        return Ok(resposta);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoverUsuarioCommand(id), cancellationToken);
        return NoContent();
    }
}

public sealed record CriarUsuarioRequest(string Nome, string Email, string Senha, bool EhAdmin);

public sealed record AtualizarUsuarioRequest(string Nome, string Email, bool EhAdmin, string? NovaSenha);
