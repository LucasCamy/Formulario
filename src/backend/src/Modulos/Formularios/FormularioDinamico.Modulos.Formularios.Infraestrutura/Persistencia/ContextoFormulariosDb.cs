using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Dominio;
using Microsoft.EntityFrameworkCore;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;

public sealed class ContextoFormulariosDb : DbContext, IUnidadeTrabalhoFormularios
{
    public ContextoFormulariosDb(DbContextOptions<ContextoFormulariosDb> options)
        : base(options)
    {
    }

    public DbSet<Formulario> Formularios => Set<Formulario>();

    public DbSet<VersaoFormulario> VersoesFormulario => Set<VersaoFormulario>();

    public DbSet<SubmissaoFormulario> SubmissoesFormulario => Set<SubmissaoFormulario>();

    public DbSet<TipoCampoCatalogo> CatalogoTiposCampo => Set<TipoCampoCatalogo>();

    public DbSet<RegistroAuditoria> RegistrosAuditoria => Set<RegistroAuditoria>();

    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ContextoFormulariosDb).Assembly);
    }
}
