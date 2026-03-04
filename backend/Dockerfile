FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY DispensaMed.Domain/DispensaMed.Domain.csproj DispensaMed.Domain/
COPY DispensaMed.Infrastructure/DispensaMed.Infrastructure.csproj DispensaMed.Infrastructure/
COPY DispensaMed.Application/DispensaMed.Application.csproj DispensaMed.Application/
COPY DispensaMed.API/DispensaMed.API.csproj DispensaMed.API/

RUN dotnet restore DispensaMed.API/DispensaMed.API.csproj

COPY . .

RUN dotnet publish DispensaMed.API/DispensaMed.API.csproj \
    -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DispensaMed.API.dll"]
