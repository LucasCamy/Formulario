using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCampoAtivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "formularios",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "formularios");
        }
    }
}
