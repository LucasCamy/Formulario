using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;

public sealed class ContextoFormulariosDbFactory : IDesignTimeDbContextFactory<ContextoFormulariosDb>
{
    public ContextoFormulariosDb CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ContextoFormulariosDb>();
        var connectionString = Environment.GetEnvironmentVariable("FORMULARIO_DINAMICO_CONNECTION_STRING")
            ?? throw new InvalidOperationException("Set FORMULARIO_DINAMICO_CONNECTION_STRING for EF tools.");

        optionsBuilder.UseNpgsql(connectionString, configuracao =>
        {
            configuracao.MigrationsHistoryTable("__ef_migrations_history_formularios");
        });

        return new ContextoFormulariosDb(optionsBuilder.Options);
    }
}
