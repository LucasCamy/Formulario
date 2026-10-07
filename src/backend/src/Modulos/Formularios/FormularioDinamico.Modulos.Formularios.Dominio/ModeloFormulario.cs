using System.Text.Json;
using System.Text.Json.Serialization;
using FormularioDinamico.BuildingBlocks.Dominio;

namespace FormularioDinamico.Modulos.Formularios.Dominio;

public enum StatusPublicacaoVersao
{
    Rascunho = 1,
    Publicada = 2,
    Arquivada = 3
}

public enum StatusSubmissao
{
    Recebida = 1,
    Processada = 2,
    Rejeitada = 3
}

public enum TipoCampo
{
    TextoCurto = 1,
    TextoLongo = 2,
    Numero = 3,
    Email = 4,
    Data = 5,
    Selecao = 6,
    Radio = 7,
    CaixaMarcacao = 8
}

public sealed class Formulario : RaizAgregado<Guid>
{
    private Formulario()
    {
    }

    public string Titulo { get; private set; } = string.Empty;

    public string? Descricao { get; private set; }

    public string Chave { get; private set; } = string.Empty;

    public bool Arquivado { get; private set; }

    public bool Ativo { get; private set; } = true;

    public DateTimeOffset CriadoEm { get; private set; }

    public DateTimeOffset AtualizadoEm { get; private set; }

    public string CriadoPor { get; private set; } = string.Empty;

    public Guid? VersaoPublicadaId { get; private set; }

    public List<VersaoFormulario> Versoes { get; private set; } = [];

    public static Formulario Criar(string titulo, string? descricao, string chave, string criadoPor)
    {
        if (string.IsNullOrWhiteSpace(titulo))
        {
            throw new InvalidOperationException("O título do formulário é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(chave))
        {
            throw new InvalidOperationException("A chave do formulário é obrigatória.");
        }

        var agora = DateTimeOffset.UtcNow;

        return new Formulario
        {
            Id = Guid.NewGuid(),
            Titulo = titulo.Trim(),
            Descricao = string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim(),
            Chave = chave.Trim().ToLowerInvariant(),
            CriadoPor = criadoPor,
            CriadoEm = agora,
            AtualizadoEm = agora,
            Arquivado = false,
            Ativo = true,
        };
    }

    public VersaoFormulario CriarVersaoRascunho(string criadoPor)
    {
        GarantirNaoArquivado();

        var numeroVersao = Versoes.Count == 0 ? 1 : Versoes.Max(x => x.NumeroVersao) + 1;
        var schemaBase = Versoes
            .OrderByDescending(x => x.NumeroVersao)
            .FirstOrDefault()?
            .ObterSchema() ?? SchemaFormulario.CriarPadrao(Titulo, Descricao);

        var versao = VersaoFormulario.Criar(Id, numeroVersao, schemaBase, criadoPor);
        Versoes.Add(versao);
        AtualizadoEm = DateTimeOffset.UtcNow;

        return versao;
    }

    public VersaoFormulario ObterVersao(Guid versaoId)
    {
        return Versoes.FirstOrDefault(x => x.Id == versaoId)
            ?? throw new InvalidOperationException("Versão do formulário não encontrada.");
    }

    public VersaoFormulario? ObterVersaoPublicada()
    {
        return Versoes.FirstOrDefault(x => x.Id == VersaoPublicadaId && x.StatusPublicacao == StatusPublicacaoVersao.Publicada);
    }

    public void PublicarVersao(Guid versaoId, string publicadoPor)
    {
        GarantirNaoArquivado();

        var versao = ObterVersao(versaoId);

        if (versao.StatusPublicacao != StatusPublicacaoVersao.Rascunho)
        {
            throw new InvalidOperationException("Somente versões em rascunho podem ser publicadas.");
        }

        foreach (var item in Versoes.Where(x => x.StatusPublicacao == StatusPublicacaoVersao.Publicada))
        {
            item.ArquivarPublicacao();
        }

        versao.Publicar(publicadoPor);
        VersaoPublicadaId = versao.Id;
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    public void Arquivar(string alteradoPor)
    {
        if (Arquivado)
        {
            return;
        }

        Arquivado = true;
        AtualizadoEm = DateTimeOffset.UtcNow;

        foreach (var versao in Versoes.Where(x => x.StatusPublicacao == StatusPublicacaoVersao.Publicada))
        {
            versao.ArquivarPublicacao();
        }

        CriadoPor = string.IsNullOrWhiteSpace(alteradoPor) ? CriadoPor : alteradoPor;
    }

    public void Atualizar(string titulo, string? descricao)
    {
        GarantirNaoArquivado();

        if (string.IsNullOrWhiteSpace(titulo))
        {
            throw new InvalidOperationException("O título do formulário é obrigatório.");
        }

        Titulo = titulo.Trim();
        Descricao = string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim();
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    public void Excluir()
    {
        if (VersaoPublicadaId is not null || Versoes.Any(x => x.StatusPublicacao == StatusPublicacaoVersao.Publicada))
        {
            throw new InvalidOperationException("Não é possível excluir um formulário que possui versão publicada. Arquive-o primeiro.");
        }

        Arquivado = true;
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    public void RemoverVersao(Guid versaoId)
    {
        var versao = ObterVersao(versaoId);

        if (versao.StatusPublicacao != StatusPublicacaoVersao.Rascunho)
        {
            throw new InvalidOperationException("Apenas versões em rascunho podem ser removidas.");
        }

        Versoes.Remove(versao);
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    public void Desativar()
    {
        Ativo = false;
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    public void Ativar()
    {
        Ativo = true;
        AtualizadoEm = DateTimeOffset.UtcNow;
    }

    private void GarantirNaoArquivado()
    {
        if (Arquivado)
        {
            throw new InvalidOperationException("O formulário está arquivado e não pode ser alterado.");
        }
    }
}

public sealed class VersaoFormulario : EntidadeBase<Guid>
{
    private VersaoFormulario()
    {
    }

    public Guid FormularioId { get; private set; }

    public int NumeroVersao { get; private set; }

    public StatusPublicacaoVersao StatusPublicacao { get; private set; }

    public string SchemaJson { get; private set; } = string.Empty;

    public DateTimeOffset CriadoEm { get; private set; }

    public DateTimeOffset? PublicadoEm { get; private set; }

    public string CriadoPor { get; private set; } = string.Empty;

    public string? PublicadoPor { get; private set; }

    public static VersaoFormulario Criar(Guid formularioId, int numeroVersao, SchemaFormulario schema, string criadoPor)
    {
        return new VersaoFormulario
        {
            Id = Guid.NewGuid(),
            FormularioId = formularioId,
            NumeroVersao = numeroVersao,
            StatusPublicacao = StatusPublicacaoVersao.Rascunho,
            CriadoPor = criadoPor,
            CriadoEm = DateTimeOffset.UtcNow,
            SchemaJson = schema.Serializar(),
        };
    }

    public SchemaFormulario ObterSchema()
    {
        return SchemaFormulario.Desserializar(SchemaJson);
    }

    public void AtualizarMetadados(string titulo, string? descricao)
    {
        var schema = ObterSchema();
        schema.Metadados.Titulo = titulo;
        schema.Metadados.Descricao = descricao;
        SchemaJson = schema.Serializar();
    }

    public void AdicionarCampo(CampoFormularioSchema campo, Guid? secaoId)
    {
        GarantirRascunho();

        var schema = ObterSchema();
        var secao = schema.ObterOuCriarSecao(secaoId);

        if (secao.Campos.Any(x => string.Equals(x.Chave, campo.Chave, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("Já existe um campo com a mesma chave nesta seção.");
        }

        campo.Ordem = campo.Ordem <= 0 ? secao.Campos.Count + 1 : campo.Ordem;
        secao.Campos.Add(campo);
        SchemaJson = schema.Serializar();
    }

    public void DefinirSchema(SchemaFormulario schema)
    {
        GarantirRascunho();
        SchemaJson = schema.Serializar();
    }

    public SecaoFormularioSchema AdicionarSecao(string titulo, string? descricao)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.AdicionarSecao(titulo, descricao);
        SchemaJson = schema.Serializar();
        return secao;
    }

    public void EditarSecao(Guid secaoId, string titulo, string? descricao)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
            ?? throw new InvalidOperationException("Seção não encontrada.");
        secao.Titulo = titulo;
        secao.Descricao = descricao;
        SchemaJson = schema.Serializar();
    }

    public void RemoverSecao(Guid secaoId)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
            ?? throw new InvalidOperationException("Seção não encontrada.");
        if (schema.Secoes.Count <= 1)
        {
            throw new InvalidOperationException("O formulário deve ter pelo menos uma seção.");
        }
        schema.Secoes.Remove(secao);
        SchemaJson = schema.Serializar();
    }

    public void EditarCampo(Guid secaoId, Guid campoId, string rotulo, string? descricao, string? placeholder, string? mascara, bool obrigatorio, bool valorUnico, IReadOnlyCollection<OpcaoCampoSchema>? opcoes, RegraRepeticaoSchema? repeticao = null)
    {
        GarantirRascunho();
        var schema = ObterSchema();

        // Localiza o campo em qualquer seção (o frontend envia a seção destino, não necessariamente a origem)
        SecaoFormularioSchema? secaoOrigem = null;
        CampoFormularioSchema? campo = null;
        foreach (var s in schema.Secoes)
        {
            campo = s.Campos.FirstOrDefault(x => x.Id == campoId);
            if (campo != null) { secaoOrigem = s; break; }
        }
        if (campo == null || secaoOrigem == null)
            throw new InvalidOperationException("Campo não encontrado.");

        // Aplica as alterações
        campo.Rotulo = rotulo;
        campo.Descricao = descricao;
        campo.Placeholder = placeholder;
        campo.Mascara = mascara;
        campo.Obrigatorio = obrigatorio;
        campo.ValorUnico = valorUnico;
        campo.Repeticao = repeticao;
        if (opcoes is not null) campo.Opcoes = opcoes.ToList();

        // Move para outra seção se necessário
        if (secaoOrigem.Id != secaoId)
        {
            var secaoDestino = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
                ?? throw new InvalidOperationException("Seção de destino não encontrada.");
            secaoOrigem.Campos.Remove(campo);
            campo.Ordem = (secaoDestino.Campos.Count > 0 ? secaoDestino.Campos.Max(c => c.Ordem) : 0) + 1;
            secaoDestino.Campos.Add(campo);
        }

        SchemaJson = schema.Serializar();
    }

    public void RemoverCampo(Guid secaoId, Guid campoId)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
            ?? throw new InvalidOperationException("Seção não encontrada.");
        var campo = secao.Campos.FirstOrDefault(x => x.Id == campoId)
            ?? throw new InvalidOperationException("Campo não encontrado.");
        secao.Campos.Remove(campo);
        SchemaJson = schema.Serializar();
    }

    public void ReordenarSecoes(IReadOnlyCollection<(Guid SecaoId, int Ordem)> secoesOrdenadas)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        foreach (var item in secoesOrdenadas)
        {
            var secao = schema.Secoes.FirstOrDefault(x => x.Id == item.SecaoId)
                ?? throw new InvalidOperationException($"Seção '{item.SecaoId}' não encontrada.");
            secao.Ordem = item.Ordem;
        }
        SchemaJson = schema.Serializar();
    }

    public void ReordenarCampos(Guid secaoId, IReadOnlyCollection<(Guid CampoId, int Ordem, int LarguraColunas)> camposOrdenados)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
            ?? throw new InvalidOperationException("Seção não encontrada.");

        foreach (var item in camposOrdenados)
        {
            var campo = secao.Campos.FirstOrDefault(x => x.Id == item.CampoId)
                ?? throw new InvalidOperationException($"Campo '{item.CampoId}' não encontrado na seção.");
            campo.Ordem = item.Ordem;
            campo.LarguraColunas = item.LarguraColunas is >= 1 and <= 12 ? item.LarguraColunas : 12;
        }

        SchemaJson = schema.Serializar();
    }

    public void AlterarLayoutCampo(Guid secaoId, Guid campoId, int larguraColunas)
    {
        GarantirRascunho();
        var schema = ObterSchema();
        var secao = schema.Secoes.FirstOrDefault(x => x.Id == secaoId)
            ?? throw new InvalidOperationException("Seção não encontrada.");
        var campo = secao.Campos.FirstOrDefault(x => x.Id == campoId)
            ?? throw new InvalidOperationException("Campo não encontrado.");
        campo.LarguraColunas = larguraColunas is >= 1 and <= 12 ? larguraColunas : 12;
        SchemaJson = schema.Serializar();
    }

    public void Publicar(string publicadoPor)
    {
        GarantirRascunho();

        StatusPublicacao = StatusPublicacaoVersao.Publicada;
        PublicadoEm = DateTimeOffset.UtcNow;
        PublicadoPor = publicadoPor;
    }

    public void ArquivarPublicacao()
    {
        StatusPublicacao = StatusPublicacaoVersao.Arquivada;
    }

    private void GarantirRascunho()
    {
        if (StatusPublicacao != StatusPublicacaoVersao.Rascunho)
        {
            throw new InvalidOperationException("Somente versões em rascunho podem ser alteradas.");
        }
    }
}

public sealed class SubmissaoFormulario : EntidadeBase<Guid>
{
    private SubmissaoFormulario()
    {
    }

    public Guid FormularioId { get; private set; }

    public Guid VersaoFormularioId { get; private set; }

    public StatusSubmissao Status { get; private set; }

    public string DadosRespostaJson { get; private set; } = string.Empty;

    public string? MetadadosJson { get; private set; }

    public DateTimeOffset CriadoEm { get; private set; }

    public string CriadoPor { get; private set; } = string.Empty;

    public static SubmissaoFormulario Criar(Guid formularioId, Guid versaoFormularioId, string dadosRespostaJson, string? metadadosJson, string criadoPor)
    {
        return new SubmissaoFormulario
        {
            Id = Guid.NewGuid(),
            FormularioId = formularioId,
            VersaoFormularioId = versaoFormularioId,
            DadosRespostaJson = dadosRespostaJson,
            MetadadosJson = metadadosJson,
            CriadoPor = criadoPor,
            CriadoEm = DateTimeOffset.UtcNow,
            Status = StatusSubmissao.Recebida,
        };
    }

    public void MarcarComoProcessada()
    {
        Status = StatusSubmissao.Processada;
    }
}

public sealed class TipoCampoCatalogo : EntidadeBase<string>
{
    private TipoCampoCatalogo()
    {
    }

    public string Nome { get; private set; } = string.Empty;

    public string Descricao { get; private set; } = string.Empty;

    public bool AceitaOpcoes { get; private set; }

    public bool AceitaMascara { get; private set; }

    public bool AceitaValidacoes { get; private set; }

    public static TipoCampoCatalogo Criar(string codigo, string nome, string descricao, bool aceitaOpcoes, bool aceitaMascara, bool aceitaValidacoes)
    {
        return new TipoCampoCatalogo
        {
            Id = codigo,
            Nome = nome,
            Descricao = descricao,
            AceitaOpcoes = aceitaOpcoes,
            AceitaMascara = aceitaMascara,
            AceitaValidacoes = aceitaValidacoes,
        };
    }
}

public sealed class RegistroAuditoria : EntidadeBase<Guid>
{
    private RegistroAuditoria()
    {
    }

    public string Modulo { get; private set; } = string.Empty;

    public string Acao { get; private set; } = string.Empty;

    public string Entidade { get; private set; } = string.Empty;

    public string EntidadeId { get; private set; } = string.Empty;

    public string Autor { get; private set; } = string.Empty;

    public string? DetalhesJson { get; private set; }

    public DateTimeOffset CriadoEm { get; private set; }

    public static RegistroAuditoria Criar(string acao, string entidade, string entidadeId, string autor, object? detalhes)
    {
        return new RegistroAuditoria
        {
            Id = Guid.NewGuid(),
            Modulo = "Formularios",
            Acao = acao,
            Entidade = entidade,
            EntidadeId = entidadeId,
            Autor = autor,
            CriadoEm = DateTimeOffset.UtcNow,
            DetalhesJson = detalhes is null ? null : JsonSerializer.Serialize(detalhes, ConfiguracoesJsonDominio.Opcoes),
        };
    }
}

public sealed class SchemaFormulario
{
    public string VersaoSchema { get; set; } = "1.0";

    public MetadadosFormularioSchema Metadados { get; set; } = new();

    public List<SecaoFormularioSchema> Secoes { get; set; } = [];

    public static SchemaFormulario CriarPadrao(string titulo, string? descricao)
    {
        return new SchemaFormulario
        {
            Metadados = new MetadadosFormularioSchema
            {
                Titulo = titulo,
                Descricao = descricao,
            },
            Secoes =
            [
                new SecaoFormularioSchema
                {
                    Id = Guid.NewGuid(),
                    Titulo = "Seção principal",
                    Descricao = "Campos principais do formulário.",
                    Ordem = 1,
                },
            ],
        };
    }

    public SecaoFormularioSchema AdicionarSecao(string titulo, string? descricao)
    {
        var secao = new SecaoFormularioSchema
        {
            Id = Guid.NewGuid(),
            Titulo = titulo,
            Descricao = descricao,
            Ordem = Secoes.Count + 1,
        };
        Secoes.Add(secao);
        return secao;
    }

    public SecaoFormularioSchema ObterOuCriarSecao(Guid? secaoId)
    {
        if (Secoes.Count == 0)
        {
            Secoes.Add(new SecaoFormularioSchema
            {
                Id = secaoId ?? Guid.NewGuid(),
                Titulo = "Seção principal",
                Descricao = "Campos principais do formulário.",
                Ordem = 1,
            });
        }

        if (secaoId is null)
        {
            return Secoes.OrderBy(x => x.Ordem).First();
        }


        var secao = Secoes.FirstOrDefault(x => x.Id == secaoId.Value);

        if (secao is not null)
        {
            return secao;
        }

        secao = new SecaoFormularioSchema
        {
            Id = secaoId.Value,
            Titulo = "Nova seção",
            Ordem = Secoes.Count + 1,
        };

        Secoes.Add(secao);

        return secao;
    }

    public string Serializar()
    {
        return JsonSerializer.Serialize(this, ConfiguracoesJsonDominio.Opcoes);
    }

    public static SchemaFormulario Desserializar(string schemaJson)
    {
        if (string.IsNullOrWhiteSpace(schemaJson))
        {
            return CriarPadrao("Formulário", null);
        }

        return JsonSerializer.Deserialize<SchemaFormulario>(schemaJson, ConfiguracoesJsonDominio.Opcoes)
            ?? throw new InvalidOperationException("Não foi possível desserializar o schema do formulário.");
    }
}

public sealed class MetadadosFormularioSchema
{
    public string Titulo { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    public bool Multipaginas { get; set; }
}

public sealed class SecaoFormularioSchema
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Titulo { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    public int Ordem { get; set; }

    public List<CampoFormularioSchema> Campos { get; set; } = [];
}

public sealed class CampoFormularioSchema
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Chave { get; set; } = string.Empty;

    public TipoCampo Tipo { get; set; }

    public string Rotulo { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    public bool Obrigatorio { get; set; }

    public string? Placeholder { get; set; }

    public string? Mascara { get; set; }

    public int Ordem { get; set; }

    public int LarguraColunas { get; set; } = 12;

    public bool ValorUnico { get; set; }

    public ValidacoesCampoSchema Validacoes { get; set; } = new();

    public RegraVisibilidadeSchema? Visibilidade { get; set; }

    public RegraRepeticaoSchema? Repeticao { get; set; }

    public List<OpcaoCampoSchema> Opcoes { get; set; } = [];
}

public sealed class OpcaoCampoSchema
{
    public string Rotulo { get; set; } = string.Empty;

    public string Valor { get; set; } = string.Empty;
}

public sealed class ValidacoesCampoSchema
{
    public int? TamanhoMinimo { get; set; }

    public int? TamanhoMaximo { get; set; }

    public decimal? ValorMinimo { get; set; }

    public decimal? ValorMaximo { get; set; }

    public string? ExpressaoRegular { get; set; }
}

public sealed class RegraVisibilidadeSchema
{
    public string CampoDependencia { get; set; } = string.Empty;

    public string Operador { get; set; } = "igual";

    public string ValorEsperado { get; set; } = string.Empty;
}

public sealed class RegraRepeticaoSchema
{
    public string CampoDependencia { get; set; } = string.Empty;

    public int LimiteMaximo { get; set; } = 20;
}

internal static class ConfiguracoesJsonDominio
{
    internal static readonly JsonSerializerOptions Opcoes = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };
}