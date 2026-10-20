using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjectSimilarity.Application.Services;

public sealed record RegistrationResult(bool Succeeded, string Message);
public sealed record LoginResult(bool Succeeded, string Message, string? Token = null, string? Role = null, string? Name = null);

public sealed class AuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthenticationService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<RegistrationResult> RegisterAsync(string name, string email, string password, string department)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        if (await _userRepository.GetByEmailAsync(normalizedEmail) is not null)
        {
            return new(false, "Email already exists.");
        }

        await _userRepository.AddAsync(new User
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Department = department.Trim(),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        });

        return new(true, "Registration successful.");
    }

    public async Task<LoginResult> LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email.Trim().ToLowerInvariant());
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return new(false, "Invalid credentials.");
        }

        if (!user.IsActive)
        {
            return new(false, "Account Deactivated: This user account has been deactivated by system administrator.");
        }

        return new(true, string.Empty, GenerateJwtToken(user), user.Role.ToString(), user.Name);
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is missing.");
        var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing.");
        var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing.");

        var claims = new[]
        {
            new Claim("userId", user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7),
            credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
