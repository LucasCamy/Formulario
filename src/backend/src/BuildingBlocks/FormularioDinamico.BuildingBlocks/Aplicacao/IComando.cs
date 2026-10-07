using Mediator;

namespace FormularioDinamico.BuildingBlocks.Aplicacao;

public interface IComando<TResposta> : IRequest<TResposta>
{
}

public interface IComando : IRequest
{
}