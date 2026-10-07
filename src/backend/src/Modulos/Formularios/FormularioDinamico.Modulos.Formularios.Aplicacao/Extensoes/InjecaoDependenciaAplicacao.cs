using FluentValidation;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Validacao;
using Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace FormularioDinamico.Modulos.Formularios.Aplicacao.Extensoes;

public static class InjecaoDependenciaAplicacao
{
    public static IServiceCollection AddAplicacaoFormularios(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ComportamentoValidacao<,>));
        services.AddValidatorsFromAssembly(typeof(InjecaoDependenciaAplicacao).Assembly);

        return services;
    }
}