using FormularioDinamico.Modulos.Formularios.Dominio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;

public sealed class FormularioConfiguracao : IEntityTypeConfiguration<Formulario>
{
    public void Configure(EntityTypeBuilder<Formulario> builder)
    {
        builder.ToTable("formularios");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Titulo).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Descricao).HasMaxLength(500);
        builder.Property(x => x.Chave).HasMaxLength(120).IsRequired();
        builder.Property(x => x.CriadoPor).HasMaxLength(120).IsRequired();

        builder.HasIndex(x => x.Chave).IsUnique();
        builder.HasIndex(x => x.AtualizadoEm);

        builder.HasMany(x => x.Versoes)
            .WithOne()
            .HasForeignKey(x => x.FormularioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class VersaoFormularioConfiguracao : IEntityTypeConfiguration<VersaoFormulario>
{
    public void Configure(EntityTypeBuilder<VersaoFormulario> builder)
    {
        builder.ToTable("formulario_versoes");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CriadoPor).HasMaxLength(120).IsRequired();
        builder.Property(x => x.PublicadoPor).HasMaxLength(120);
        builder.Property(x => x.SchemaJson).HasColumnType("jsonb").IsRequired();

        builder.HasIndex(x => new { x.FormularioId, x.NumeroVersao }).IsUnique();
        builder.HasIndex(x => x.StatusPublicacao);
    }
}

public sealed class SubmissaoFormularioConfiguracao : IEntityTypeConfiguration<SubmissaoFormulario>
{
    public void Configure(EntityTypeBuilder<SubmissaoFormulario> builder)
    {
        builder.ToTable("submissoes_formulario");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CriadoPor).HasMaxLength(120).IsRequired();
        builder.Property(x => x.DadosRespostaJson).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.MetadadosJson).HasColumnType("jsonb");

        builder.HasIndex(x => x.FormularioId);
        builder.HasIndex(x => x.VersaoFormularioId);
        builder.HasIndex(x => x.CriadoEm);
    }
}

public sealed class TipoCampoCatalogoConfiguracao : IEntityTypeConfiguration<TipoCampoCatalogo>
{
    public void Configure(EntityTypeBuilder<TipoCampoCatalogo> builder)
    {
        builder.ToTable("catalogo_tipos_campo");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasMaxLength(60);
        builder.Property(x => x.Nome).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Descricao).HasMaxLength(240).IsRequired();

        builder.HasData(
            TipoCampoCatalogo.Criar("texto-curto", "Texto curto", "Entrada textual de linha única.", false, true, true),
            TipoCampoCatalogo.Criar("texto-longo", "Texto longo", "Entrada textual multilinha.", false, false, true),
            TipoCampoCatalogo.Criar("numero", "Número", "Entrada numérica com limites opcionais.", false, false, true),
            TipoCampoCatalogo.Criar("email", "E-mail", "Entrada textual com formato de e-mail.", false, false, true),
            TipoCampoCatalogo.Criar("data", "Data", "Campo de data.", false, false, true),
            TipoCampoCatalogo.Criar("selecao", "Seleção", "Lista suspensa com opções.", true, false, true),
            TipoCampoCatalogo.Criar("radio", "Opção única", "Escolha única com botões de rádio.", true, false, true),
            TipoCampoCatalogo.Criar("caixa-marcacao", "Caixa de marcação", "Controle booleano de marcação.", false, false, false));
    }
}

public sealed class RegistroAuditoriaConfiguracao : IEntityTypeConfiguration<RegistroAuditoria>
{
    public void Configure(EntityTypeBuilder<RegistroAuditoria> builder)
    {
        builder.ToTable("logs_auditoria");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Modulo).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Acao).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Entidade).HasMaxLength(120).IsRequired();
        builder.Property(x => x.EntidadeId).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Autor).HasMaxLength(120).IsRequired();
        builder.Property(x => x.DetalhesJson).HasColumnType("jsonb");

        builder.HasIndex(x => x.CriadoEm);
        builder.HasIndex(x => new { x.Modulo, x.Acao });
    }
}

public sealed class UsuarioConfiguracao : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Nome).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(200).IsRequired();
        builder.Property(x => x.SenhaHash).HasMaxLength(200).IsRequired();

        builder.HasIndex(x => x.Email).IsUnique();
    }
}
