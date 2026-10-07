using FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormularioDinamico.Api.Controllers;

[ApiController]
[Route("api/submissoes")]
[AllowAnonymous]
public sealed class SubmissoesController : ControllerBase
{
    private readonly IMediator _sender;

    public SubmissoesController(IMediator sender)
    {
        _sender = sender;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ObterSubmissaoPorIdQuery(id), cancellationToken);
        return Ok(resposta);
    }
}
