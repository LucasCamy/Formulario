using FormularioDinamico.Modulos.Formularios.Aplicacao.CasosDeUso;
using FormularioDinamico.Modulos.Formularios.Dominio;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormularioDinamico.Api.Controllers;

[ApiController]
[Route("api/formularios")]
[Authorize]
public sealed class FormulariosController : ControllerBase
{
    private readonly IMediator _sender;

    public FormulariosController(IMediator sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ListarFormulariosQuery(), cancellationToken);
        return Ok(resposta);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ObterFormularioPorIdQuery(id), cancellationToken);
        return Ok(resposta);
    }

    [HttpGet("{id:guid}/builder")]
    public async Task<IActionResult> ObterBuilder(Guid id, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ObterBuilderFormularioQuery(id), cancellationToken);
        return Ok(resposta);
    }

    [HttpGet("{id:guid}/publicado")]
    [AllowAnonymous]
    public async Task<IActionResult> ObterPublicado(Guid id, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ObterVersaoPublicadaFormularioQuery(id), cancellationToken);
        return Ok(resposta);
    }

    [HttpGet("chave/{chave}/publicado")]
    [AllowAnonymous]
    public async Task<IActionResult> ObterPublicadoPorChave(string chave, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ObterVersaoPublicadaPorChaveQuery(chave), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new CriarFormularioCommand(request.Titulo, request.Descricao, request.Chave, request.CriadoPor), cancellationToken);
        return CreatedAtAction(nameof(ObterPorId), new { id = resposta.Id }, resposta);
    }

    [HttpPost("{id:guid}/versoes")]
    public async Task<IActionResult> CriarVersao(Guid id, [FromBody] CriarVersaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new CriarVersaoRascunhoCommand(id, request.CriadoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost("{id:guid}/versoes/{versaoId:guid}/campos")]
    public async Task<IActionResult> AdicionarCampo(Guid id, Guid versaoId, [FromBody] AdicionarCampoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new AdicionarCampoCommand(
            id,
            versaoId,
            request.SecaoId,
            request.Chave,
            request.Rotulo,
            request.Descricao,
            request.Tipo,
            request.Obrigatorio,
            request.Placeholder,
            request.Mascara,
            request.Ordem,
            request.Validacoes,
            request.Visibilidade,
            request.Repeticao,
            request.Opcoes,
            request.ValorUnico,
            request.AlteradoPor), cancellationToken);

        return Ok(resposta);
    }

    [HttpPost("{id:guid}/versoes/{versaoId:guid}/secoes")]
    public async Task<IActionResult> AdicionarSecao(Guid id, Guid versaoId, [FromBody] AdicionarSecaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new AdicionarSecaoCommand(id, versaoId, request.Titulo, request.Descricao, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost("{id:guid}/versoes/{versaoId:guid}/publicar")]
    public async Task<IActionResult> PublicarVersao(Guid id, Guid versaoId, [FromBody] PublicarVersaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new PublicarVersaoFormularioCommand(id, versaoId, request.PublicadoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost("{id:guid}/submissoes")]
    [AllowAnonymous]
    public async Task<IActionResult> Submeter(Guid id, [FromBody] SubmeterFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new SubmeterRespostaFormularioCommand(id, request.DadosResposta, request.Metadados, request.CriadoPor), cancellationToken);
        return CreatedAtAction(nameof(SubmissoesController.ObterPorId), "Submissoes", new { id = resposta.Id }, resposta);
    }

    [HttpPost("{id:guid}/arquivar")]
    public async Task<IActionResult> Arquivar(Guid id, [FromBody] ArquivarFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ArquivarFormularioCommand(id, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new EditarFormularioCommand(id, request.Titulo, request.Descricao, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, [FromBody] ExcluirFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ExcluirFormularioCommand(id, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPut("{id:guid}/versoes/{versaoId:guid}/secoes/{secaoId:guid}")]
    public async Task<IActionResult> EditarSecao(Guid id, Guid versaoId, Guid secaoId, [FromBody] EditarSecaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new EditarSecaoCommand(id, versaoId, secaoId, request.Titulo, request.Descricao, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpDelete("{id:guid}/versoes/{versaoId:guid}/secoes/{secaoId:guid}")]
    public async Task<IActionResult> RemoverSecao(Guid id, Guid versaoId, Guid secaoId, [FromBody] RemoverSecaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new RemoverSecaoCommand(id, versaoId, secaoId, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPut("{id:guid}/versoes/{versaoId:guid}/secoes/{secaoId:guid}/campos/{campoId:guid}")]
    public async Task<IActionResult> EditarCampo(Guid id, Guid versaoId, Guid secaoId, Guid campoId, [FromBody] EditarCampoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new EditarCampoCommand(id, versaoId, secaoId, campoId, request.Rotulo, request.Descricao, request.Placeholder, request.Mascara, request.Obrigatorio, request.ValorUnico, request.Opcoes, request.Repeticao, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpDelete("{id:guid}/versoes/{versaoId:guid}/secoes/{secaoId:guid}/campos/{campoId:guid}")]
    public async Task<IActionResult> RemoverCampo(Guid id, Guid versaoId, Guid secaoId, Guid campoId, [FromBody] RemoverCampoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new RemoverCampoCommand(id, versaoId, secaoId, campoId, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpGet("{id:guid}/versoes/{versaoId:guid}/submissoes")]
    public async Task<IActionResult> ListarSubmissoes(Guid id, Guid versaoId, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new ListarSubmissoesPorVersaoQuery(id, versaoId), cancellationToken);
        return Ok(resposta);
    }

    [HttpDelete("{id:guid}/versoes/{versaoId:guid}")]
    public async Task<IActionResult> RemoverVersao(Guid id, Guid versaoId, [FromBody] RemoverVersaoRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new RemoverVersaoCommand(id, versaoId, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost("{id:guid}/desativar")]
    public async Task<IActionResult> Desativar(Guid id, [FromBody] DesativarFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new DesativarFormularioCommand(id, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPost("{id:guid}/ativar")]
    public async Task<IActionResult> Ativar(Guid id, [FromBody] AtivarFormularioRequest request, CancellationToken cancellationToken)
    {
        var resposta = await _sender.Send(new AtivarFormularioCommand(id, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPut("{id:guid}/versoes/{versaoId:guid}/secoes/{secaoId:guid}/campos/reordenar")]
    public async Task<IActionResult> ReordenarCampos(Guid id, Guid versaoId, Guid secaoId, [FromBody] ReordenarCamposRequest request, CancellationToken cancellationToken)
    {
        var campos = request.Campos.Select(c => new CampoOrdemDto(c.CampoId, c.Ordem, c.LarguraColunas)).ToArray();
        var resposta = await _sender.Send(new ReordenarCamposCommand(id, versaoId, secaoId, campos, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }

    [HttpPut("{id:guid}/versoes/{versaoId:guid}/secoes/reordenar")]
    public async Task<IActionResult> ReordenarSecoes(Guid id, Guid versaoId, [FromBody] ReordenarSecoesRequest request, CancellationToken cancellationToken)
    {
        var secoes = request.Secoes.Select(s => new SecaoOrdemDto(s.SecaoId, s.Ordem)).ToArray();
        var resposta = await _sender.Send(new ReordenarSecoesCommand(id, versaoId, secoes, request.AlteradoPor), cancellationToken);
        return Ok(resposta);
    }
}

public sealed record CriarFormularioRequest(string Titulo, string? Descricao, string Chave, string CriadoPor);

public sealed record CriarVersaoRequest(string CriadoPor);

public sealed record PublicarVersaoRequest(string PublicadoPor);

public sealed record ArquivarFormularioRequest(string AlteradoPor);

public sealed record SubmeterFormularioRequest(System.Text.Json.JsonElement DadosResposta, System.Text.Json.JsonElement? Metadados, string CriadoPor);

public sealed record AdicionarSecaoRequest(string Titulo, string? Descricao, string AlteradoPor);

public sealed record AdicionarCampoRequest(
    Guid? SecaoId,
    string Chave,
    string Rotulo,
    string? Descricao,
    TipoCampo Tipo,
    bool Obrigatorio,
    string? Placeholder,
    string? Mascara,
    int Ordem,
    ValidacoesCampoSchema? Validacoes,
    RegraVisibilidadeSchema? Visibilidade,
    IReadOnlyCollection<OpcaoCampoSchema>? Opcoes,
    bool ValorUnico,
    RegraRepeticaoSchema? Repeticao,
    string AlteradoPor);

public sealed record EditarFormularioRequest(string Titulo, string? Descricao, string AlteradoPor);

public sealed record ExcluirFormularioRequest(string AlteradoPor);

public sealed record EditarSecaoRequest(string Titulo, string? Descricao, string AlteradoPor);

public sealed record RemoverSecaoRequest(string AlteradoPor);

public sealed record EditarCampoRequest(string Rotulo, string? Descricao, string? Placeholder, string? Mascara, bool Obrigatorio, bool ValorUnico, IReadOnlyCollection<OpcaoCampoSchema>? Opcoes, RegraRepeticaoSchema? Repeticao, string AlteradoPor);

public sealed record RemoverCampoRequest(string AlteradoPor);

public sealed record RemoverVersaoRequest(string AlteradoPor);

public sealed record DesativarFormularioRequest(string AlteradoPor);

public sealed record AtivarFormularioRequest(string AlteradoPor);

public sealed record ReordenarCampoItemRequest(Guid CampoId, int Ordem, int LarguraColunas);

public sealed record ReordenarCamposRequest(IReadOnlyCollection<ReordenarCampoItemRequest> Campos, string AlteradoPor);

public sealed record ReordenarSecaoItemRequest(Guid SecaoId, int Ordem);

public sealed record ReordenarSecoesRequest(IReadOnlyCollection<ReordenarSecaoItemRequest> Secoes, string AlteradoPor);
