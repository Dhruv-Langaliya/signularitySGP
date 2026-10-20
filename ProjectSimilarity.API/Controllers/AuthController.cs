using Microsoft.AspNetCore.Mvc;
using ProjectSimilarity.API.Constants;
using ProjectSimilarity.API.DTOs;
using ProjectSimilarity.Application.Services;

namespace ProjectSimilarity.API.Controllers;

[ApiController]
[Route(AuthConstants.BaseRoute)]
public class AuthController : ControllerBase
{
    private readonly AuthenticationService _authenticationService;

    public AuthController(AuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost(AuthConstants.RegisterRoute)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8 ||
            string.IsNullOrWhiteSpace(dto.Department))
        {
            return BadRequest(new { message = "Name, email, department, and a password of at least 8 characters are required." });
        }

        var result = await _authenticationService.RegisterAsync(dto.Name, dto.Email, dto.Password, dto.Department);
        return result.Succeeded
            ? Ok(new { message = result.Message })
            : Conflict(new { message = result.Message });
    }

    [HttpPost(AuthConstants.LoginRoute)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = AuthConstants.EmailAndPasswordRequired });
        }

        var result = await _authenticationService.LoginAsync(dto.Email, dto.Password);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(new
        {
            token = result.Token,
            role = result.Role,
            name = result.Name
        });
    }
}
