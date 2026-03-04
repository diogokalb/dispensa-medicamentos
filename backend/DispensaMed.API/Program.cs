using System.Text;
using DispensaMed.Application.Interfaces;
using DispensaMed.Application.Services;
using DispensaMed.Domain.Interfaces;
using DispensaMed.Infrastructure.Configuration;
using DispensaMed.Infrastructure.Data;
using DispensaMed.Infrastructure.Helpers;
using DispensaMed.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ─── Config.ini ──────────────────────────────────────────────────────────────

var configIniRelativePath = builder.Configuration["ConfigIni:Path"] ?? "Config.ini";
var configIniPath = Path.IsPathRooted(configIniRelativePath)
    ? configIniRelativePath
    : Path.Combine(AppContext.BaseDirectory, configIniRelativePath);

IniFileReader iniReader;
try
{
    iniReader = new IniFileReader(configIniPath);
}
catch (FileNotFoundException)
{
    throw new InvalidOperationException(
        $"Config.ini not found at path '{configIniPath}'. " +
        "Please set ConfigIni:Path in appsettings.json.");
}

var databasePath = iniReader.GetValue("GERAL", "DATABASE")
    ?? throw new InvalidOperationException(
        $"Key 'DATABASE' not found in section [GERAL] of '{configIniPath}'. " +
        "Please verify the Config.ini file.");

// Populate ConfigIniSettings from the [GERAL] section
var configIniSettings = new ConfigIniSettings
{
    Database      = databasePath,
    DatabaseFotos = iniReader.GetValue("GERAL", "DATABASEFOTOS") ?? string.Empty,
    Prefeitura    = iniReader.GetValue("GERAL", "PREFEITURA")    ?? string.Empty,
    Secretaria    = iniReader.GetValue("GERAL", "SECRETARIA")    ?? string.Empty,
    Cidade        = iniReader.GetValue("GERAL", "CIDADE")        ?? string.Empty,
    Cgc           = iniReader.GetValue("GERAL", "CGC")           ?? string.Empty,
    Modulo        = iniReader.GetValue("GERAL", "MODULO")        ?? string.Empty,
};

// Build the Firebird connection string dynamically
var fbSettings = builder.Configuration.GetSection("FirebirdSettings").Get<FirebirdSettings>()
    ?? new FirebirdSettings();

var firebirdConnectionString =
    $"DataSource={fbSettings.DataSource};" +
    $"Port={fbSettings.Port};" +
    $"Database={databasePath};" +
    $"User={fbSettings.User};" +
    $"Password={fbSettings.Password};" +
    $"Charset={fbSettings.Charset};" +
    $"ServerType={fbSettings.ServerType}";

// Inject the built connection string so existing code using
// IConfiguration.GetConnectionString("Firebird") continues to work.
builder.Configuration["ConnectionStrings:Firebird"] = firebirdConnectionString;

// ─── Services ────────────────────────────────────────────────────────────────

builder.Services.AddControllers();

// Register ConfigIniSettings and FirebirdSettings as IOptions<T>
builder.Services.AddSingleton(Options.Create(configIniSettings));
builder.Services.AddOptions<FirebirdSettings>().BindConfiguration("FirebirdSettings");

// CORS – allows the Next.js frontend (http://localhost:3000) to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:3000"];

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Infrastructure
builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddScoped<DatabaseInitializer>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// Application
builder.Services.AddScoped<IAuthService, AuthService>();

// ─── Build & Configure ───────────────────────────────────────────────────────

var app = builder.Build();

var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
startupLogger.LogInformation(
    "Config.ini loaded from '{ConfigIniPath}'. Using database: '{DatabasePath}'.",
    configIniPath, databasePath);

// Run DB initialization on startup
using (var scope = app.Services.CreateScope())
{
    var dbInit = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await dbInit.InitializeAsync();
}

if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
