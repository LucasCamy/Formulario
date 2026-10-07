FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY NuGet.Config ./
COPY src/backend/src/BuildingBlocks/FormularioDinamico.BuildingBlocks/FormularioDinamico.BuildingBlocks.csproj src/backend/src/BuildingBlocks/FormularioDinamico.BuildingBlocks/
COPY src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Dominio/FormularioDinamico.Modulos.Formularios.Dominio.csproj src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Dominio/
COPY src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Aplicacao/FormularioDinamico.Modulos.Formularios.Aplicacao.csproj src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Aplicacao/
COPY src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Infraestrutura/FormularioDinamico.Modulos.Formularios.Infraestrutura.csproj src/backend/src/Modulos/Formularios/FormularioDinamico.Modulos.Formularios.Infraestrutura/
COPY src/backend/src/WebApi/FormularioDinamico.Api/FormularioDinamico.Api.csproj src/backend/src/WebApi/FormularioDinamico.Api/

RUN dotnet restore src/backend/src/WebApi/FormularioDinamico.Api/FormularioDinamico.Api.csproj --configfile /src/NuGet.Config

COPY src/backend ./src/backend
RUN dotnet publish src/backend/src/WebApi/FormularioDinamico.Api/FormularioDinamico.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FormularioDinamico.Api.dll"]
