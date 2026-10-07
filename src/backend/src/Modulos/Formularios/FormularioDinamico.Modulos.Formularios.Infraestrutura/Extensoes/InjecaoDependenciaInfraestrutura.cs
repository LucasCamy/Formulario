using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Infraestrutura.Autenticacao;
using FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Extensoes;

public static class InjecaoDependenciaInfraestrutura
{
    public static IServiceCollection AddInfraestruturaFormularios(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Principal")
            ?? configuration["FORMULARIO_DINAMICO_CONNECTION_STRING"]
            ?? throw new InvalidOperationException("Connection string 'Principal' não configurada.");

        services.AddDbContext<ContextoFormulariosDb>(opcoes =>
        {
            opcoes.UseNpgsql(connectionString, configuracao =>
            {
                configuracao.MigrationsHistoryTable("__ef_migrations_history_formularios");
            });
        });

        services.AddScoped<IRepositorioFormulario, RepositorioFormulario>();
        services.AddScoped<IRepositorioSubmissao, RepositorioSubmissao>();
        services.AddScoped<IRepositorioCatalogoTipoCampo, RepositorioCatalogoTipoCampo>();
        services.AddScoped<IRepositorioAuditoria, RepositorioAuditoria>();
        services.AddScoped<IRepositorioUsuario, RepositorioUsuario>();
        services.AddScoped<IServicoAutenticacao, ServicoAutenticacao>();
        services.AddScoped<IUnidadeTrabalhoFormularios>(provider => provider.GetRequiredService<ContextoFormulariosDb>());

        return services;
    }
}
