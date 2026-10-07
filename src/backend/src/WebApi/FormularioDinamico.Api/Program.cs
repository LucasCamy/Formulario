using System.Text;
using FluentValidation;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Abstracoes;
using FormularioDinamico.Modulos.Formularios.Aplicacao.Extensoes;
using FormularioDinamico.Modulos.Formularios.Dominio;
using FormularioDinamico.Modulos.Formularios.Infraestrutura.Extensoes;
using FormularioDinamico.Modulos.Formularios.Infraestrutura.Persistencia;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(opcoes =>
{
    opcoes.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    opcoes.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
});
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Set Jwt:Secret or Jwt__Secret.");
var jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(opcoes =>
{
    opcoes.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opcoes.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opcoes =>
{
    opcoes.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Emissor"] ?? "FormularioDinamico",
        ValidAudience = builder.Configuration["Jwt:Audiencia"] ?? "FormularioDinamico",
        IssuerSigningKey = jwtKey,
    };
});

builder.Services.AddAuthorization();

var origensPermitidas = (builder.Configuration["Cors:Origins"] ?? "https://formulario.cloudlane.com.br")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(opcoes =>
{
    opcoes.AddPolicy("frontend", politica =>
    {
        politica
            .WithOrigins(origensPermitidas)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddMediator(opts => opts.ServiceLifetime = ServiceLifetime.Scoped);
builder.Services.AddAplicacaoFormularios();
builder.Services.AddInfraestruturaFormularios(builder.Configuration);

builder.Services.Configure<ApiBehaviorOptions>(opcoes =>
{
    opcoes.SuppressModelStateInvalidFilter = true;
});

var app = builder.Build();

app.UseExceptionHandler(tratador =>
{
    tratador.Run(async contexto =>
    {
        var excecao = contexto.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        var traceId = contexto.TraceIdentifier;
        var statusCode = excecao switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            InvalidOperationException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError,
        };

        contexto.Response.StatusCode = statusCode;
        contexto.Response.ContentType = "application/problem+json";

        var detalhes = new ProblemDetails
        {
            Status = statusCode,
            Title = excecao switch
            {
                ValidationException => "Dados inválidos.",
                InvalidOperationException => "A operação não pôde ser concluída.",
                _ => "Erro interno na API.",
            },
            Detail = excecao switch
            {
                ValidationException validacao => string.Join(" ", validacao.Errors.Select(x => x.ErrorMessage).Distinct()),
                InvalidOperationException => excecao?.Message,
                _ => "Ocorreu um erro inesperado ao processar a requisição.",
            },
            Instance = contexto.Request.Path,
        };

        detalhes.Extensions["traceId"] = traceId;
        detalhes.Extensions["code"] = excecao switch
        {
            ValidationException => "validation_error",
            InvalidOperationException => "business_rule_error",
            _ => "internal_error",
        };

        if (excecao is ValidationException validacaoEx)
        {
            detalhes.Extensions["errors"] = validacaoEx.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    grupo => grupo.Key,
                    grupo => grupo.Select(x => x.ErrorMessage).Distinct().ToArray());
        }

        await contexto.Response.WriteAsJsonAsync(detalhes);
    });
});

app.MapOpenApi();

using (var escopo = app.Services.CreateScope())
{
    var contextoDb = escopo.ServiceProvider.GetRequiredService<ContextoFormulariosDb>();
    await contextoDb.Database.MigrateAsync();

    // Seed admin user if none exists
    if (!await contextoDb.Usuarios.AnyAsync())
    {
        var servicoAuth = escopo.ServiceProvider.GetRequiredService<IServicoAutenticacao>();
        var admin = Usuario.Criar("Administrador", "admin@formulario.local", servicoAuth.GerarHashSenha("admin123"), true);
        contextoDb.Usuarios.Add(admin);
        await contextoDb.SaveChangesAsync();
    }
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/", () => Results.Redirect("/openapi/v1.json", false));

app.Run();
