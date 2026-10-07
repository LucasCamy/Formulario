using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class InicialFormularios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "catalogo_tipos_campo",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    AceitaOpcoes = table.Column<bool>(type: "boolean", nullable: false),
                    AceitaMascara = table.Column<bool>(type: "boolean", nullable: false),
                    AceitaValidacoes = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalogo_tipos_campo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "formularios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Chave = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Arquivado = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CriadoPor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    VersaoPublicadaId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formularios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "logs_auditoria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Modulo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Acao = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Entidade = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    EntidadeId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Autor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    DetalhesJson = table.Column<string>(type: "jsonb", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_logs_auditoria", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "submissoes_formulario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormularioId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersaoFormularioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DadosRespostaJson = table.Column<string>(type: "jsonb", nullable: false),
                    MetadadosJson = table.Column<string>(type: "jsonb", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CriadoPor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_submissoes_formulario", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "formulario_versoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormularioId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumeroVersao = table.Column<int>(type: "integer", nullable: false),
                    StatusPublicacao = table.Column<int>(type: "integer", nullable: false),
                    SchemaJson = table.Column<string>(type: "jsonb", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublicadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    PublicadoPor = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formulario_versoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_formulario_versoes_formularios_FormularioId",
                        column: x => x.FormularioId,
                        principalTable: "formularios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "catalogo_tipos_campo",
                columns: new[] { "Id", "AceitaMascara", "AceitaOpcoes", "AceitaValidacoes", "Descricao", "Nome" },
                values: new object[,]
                {
                    { "caixa-marcacao", false, false, false, "Controle booleano de marcação.", "Caixa de marcação" },
                    { "data", false, false, true, "Campo de data.", "Data" },
                    { "email", false, false, true, "Entrada textual com formato de e-mail.", "E-mail" },
                    { "numero", false, false, true, "Entrada numérica com limites opcionais.", "Número" },
                    { "radio", false, true, true, "Escolha única com botões de rádio.", "Opção única" },
                    { "selecao", false, true, true, "Lista suspensa com opções.", "Seleção" },
                    { "texto-curto", true, false, true, "Entrada textual de linha única.", "Texto curto" },
                    { "texto-longo", false, false, true, "Entrada textual multilinha.", "Texto longo" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_formulario_versoes_FormularioId_NumeroVersao",
                table: "formulario_versoes",
                columns: new[] { "FormularioId", "NumeroVersao" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_formulario_versoes_StatusPublicacao",
                table: "formulario_versoes",
                column: "StatusPublicacao");

            migrationBuilder.CreateIndex(
                name: "IX_formularios_AtualizadoEm",
                table: "formularios",
                column: "AtualizadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_formularios_Chave",
                table: "formularios",
                column: "Chave",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_logs_auditoria_CriadoEm",
                table: "logs_auditoria",
                column: "CriadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_logs_auditoria_Modulo_Acao",
                table: "logs_auditoria",
                columns: new[] { "Modulo", "Acao" });

            migrationBuilder.CreateIndex(
                name: "IX_submissoes_formulario_CriadoEm",
                table: "submissoes_formulario",
                column: "CriadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_submissoes_formulario_FormularioId",
                table: "submissoes_formulario",
                column: "FormularioId");

            migrationBuilder.CreateIndex(
                name: "IX_submissoes_formulario_VersaoFormularioId",
                table: "submissoes_formulario",
                column: "VersaoFormularioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "catalogo_tipos_campo");

            migrationBuilder.DropTable(
                name: "formulario_versoes");

            migrationBuilder.DropTable(
                name: "logs_auditoria");

            migrationBuilder.DropTable(
                name: "submissoes_formulario");

            migrationBuilder.DropTable(
                name: "formularios");
        }
    }
}
