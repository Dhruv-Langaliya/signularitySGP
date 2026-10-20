using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ProjectSimilarity.API.Constants;
using ProjectSimilarity.Application.Services;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using ProjectSimilarity.Infrastructure.Data;
using ProjectSimilarity.Infrastructure.Repositories;
using ProjectSimilarity.MLEngine.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(AuthConstants.SwaggerDocumentName, new OpenApiInfo { Title = AuthConstants.SwaggerTitle, Version = AuthConstants.SwaggerDocumentName });

    options.AddSecurityDefinition(AuthConstants.SwaggerSecuritySchemeName, new OpenApiSecurityScheme
    {
        Name = AuthConstants.AuthorizationHeaderName,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = AuthConstants.SwaggerBearerFormat,
        In = ParameterLocation.Header,
        Description = "Paste only your JWT token. Swagger adds the Bearer prefix automatically."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = AuthConstants.SwaggerSecuritySchemeName
                }
            },
            Array.Empty<string>()
        }
    });
});

var databasePath = Path.Combine(builder.Environment.ContentRootPath, "Data", "ProjectSimilarity.db");
Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath}", sqliteOptions =>
        sqliteOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

var jwtSecret = builder.Configuration[AuthConstants.JwtSecretKey] ?? throw new InvalidOperationException($"{AuthConstants.JwtSecretKey} is missing.");
var jwtIssuer = builder.Configuration[AuthConstants.JwtIssuerKey] ?? throw new InvalidOperationException($"{AuthConstants.JwtIssuerKey} is missing.");
var jwtAudience = builder.Configuration[AuthConstants.JwtAudienceKey] ?? throw new InvalidOperationException($"{AuthConstants.JwtAudienceKey} is missing.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ISimilarityRepository, SimilarityRepository>();
builder.Services.AddScoped<TextExtractorService>();
builder.Services.AddScoped<SimilarityService>();
builder.Services.AddScoped<AuthenticationService>();
builder.Services.AddScoped<AdministrationService>();

var app = builder.Build();

var uploadDirectory = Path.Combine(app.Environment.ContentRootPath, "Data", AuthConstants.UploadsFolderName);
Directory.CreateDirectory(uploadDirectory);

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    Console.WriteLine($"Database path: {databasePath}");
    Console.WriteLine($"Connection string: {dbContext.Database.GetConnectionString()}");

    dbContext.Database.EnsureCreated();
    Console.WriteLine("SQLite schema created.");

    var legacyUploadDirectory = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), AuthConstants.UploadsFolderName);
    if (Directory.Exists(legacyUploadDirectory))
    {
        foreach (var legacyFile in Directory.GetFiles(legacyUploadDirectory))
        {
            var fileName = Path.GetFileName(legacyFile);
            var privatePath = Path.Combine(uploadDirectory, fileName);

            if (!File.Exists(privatePath))
            {
                File.Move(legacyFile, privatePath);
                Console.WriteLine($"Migrated project document to private storage: {fileName}");
            }
        }
    }

    using (var connection = dbContext.Database.GetDbConnection())
    {
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "PRAGMA table_info(Users);";
        using var reader = command.ExecuteReader();

        var hasIsActive = false;
        while (reader.Read())
        {
            var colName = reader["name"]?.ToString();
            if (string.Equals(colName, "IsActive", StringComparison.OrdinalIgnoreCase))
            {
                hasIsActive = true;
                break;
            }
        }

        if (!hasIsActive)
        {
            using var alterCmd = connection.CreateCommand();
            alterCmd.CommandText = "ALTER TABLE Users ADD COLUMN IsActive INTEGER NOT NULL DEFAULT 1;";
            alterCmd.ExecuteNonQuery();
            Console.WriteLine("Added IsActive column to Users table.");
        }
    }

    if (!dbContext.Users.Any())
    {
        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@projectsimilarity.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
            Department = "Administration",
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Name = "Dr. Ankita Chopra",
            Email = "faculty@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Faculty@123"),
            Department = "Computer Science",
            Role = UserRole.Faculty,
            CreatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Name = "Dhruv",
            Email = "student@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
            Department = "Computer Science",
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        });

        dbContext.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
