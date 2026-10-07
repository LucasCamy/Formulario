using FluentValidation;
using Mediator;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.Validacao;

public sealed class ComportamentoValidacao<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull, IMessage
{
    private readonly IEnumerable<IValidator<TRequest>> _validadores;

    public ComportamentoValidacao(IEnumerable<IValidator<TRequest>> validadores)
    {
        _validadores = validadores;
    }

    public async ValueTask<TResponse> Handle(
        TRequest request,
        MessageHandlerDelegate<TRequest, TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validadores.Any())
        {
            return await next(request, cancellationToken);
        }

        var contexto = new ValidationContext<TRequest>(request);
        var resultados = await Task.WhenAll(_validadores.Select(x => x.ValidateAsync(contexto, cancellationToken)));

        var falhas = resultados
            .SelectMany(x => x.Errors)
            .Where(x => x is not null)
            .ToList();

        if (falhas.Count != 0)
        {
            throw new ValidationException(falhas);
        }

        return await next(request, cancellationToken);
    }
}