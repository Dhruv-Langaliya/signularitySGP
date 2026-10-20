using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectSimilarity.API.Constants;
using ProjectSimilarity.API.DTOs;
using ProjectSimilarity.Application.Services;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using System.Security.Claims;

namespace ProjectSimilarity.API.Controllers;

[ApiController]
[Route(AuthConstants.AdminBaseRoute)]
[Authorize(Roles = AuthConstants.AdminOnlyRole)]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ISimilarityRepository _similarityRepository;
    private readonly AdministrationService _administrationService;

    public AdminController(
        IUserRepository userRepository,
        IProjectRepository projectRepository,
        ISimilarityRepository similarityRepository,
        AdministrationService administrationService)
    {
        _userRepository = userRepository;
        _projectRepository = projectRepository;
        _similarityRepository = similarityRepository;
        _administrationService = administrationService;
    }

    [HttpGet(AuthConstants.AdminDashboardRoute)]
    public async Task<IActionResult> Dashboard()
    {
        var users = await _userRepository.GetAllAsync();
        var projects = await _projectRepository.GetAllAsync();
        var summary = new
        {
            totalUsers = users.Count,
            totalStudents = users.Count(user => user.Role == UserRole.Student),
            totalFaculty = users.Count(user => user.Role == UserRole.Faculty),
            totalAdmins = users.Count(user => user.Role == UserRole.Admin),
            totalProjects = projects.Count,
            totalPendingProjects = projects.Count(project => project.Status == ProjectStatus.Pending),
            totalApprovedProjects = projects.Count(project => project.Status == ProjectStatus.Approved),
            totalFlaggedProjects = projects.Count(project => project.Status == ProjectStatus.Flagged)
        };

        return Ok(new
        {
            summary,
            users = users.Select(user => new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.Department,
                user.IsActive,
                user.CreatedAt
            }),
            projects = projects.Select(project => new
            {
                project.Id,
                project.Title,
                project.Domain,
                project.AcademicYear,
                project.UploadedBy,
                uploadedByName = project.UploadedByUser?.Name,
                project.Status,
                project.CreatedAt
            })
        });
    }

    [HttpPut("users/{userId:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UpdateUserRoleDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Role))
        {
            return BadRequest(new { message = "Role is required." });
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var newRole))
        {
            return BadRequest(new { message = "Invalid role." });
        }

        var currentAdminIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(currentAdminIdValue, out var currentAdminId))
        {
            return Unauthorized(new { message = AuthConstants.InvalidUserTokenMessage });
        }

        var result = await _administrationService.UpdateUserRoleAsync(userId, newRole, currentAdminId);
        if (!result.Succeeded)
        {
            return result.Message == "User not found."
                ? NotFound(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message, userId, role = result.Role.ToString() });
    }

    [HttpPut("users/{userId:guid}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        var currentAdminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.Equals(currentAdminId, userId.ToString(), StringComparison.OrdinalIgnoreCase) && user.IsActive)
        {
            return BadRequest(new { message = "You cannot deactivate your own Administrator account." });
        }

        user.IsActive = !user.IsActive;
        await _userRepository.UpdateAsync(user);

        return Ok(new
        {
            message = $"User status updated to {(user.IsActive ? "Active" : "Inactive")}.",
            userId = user.Id,
            isActive = user.IsActive
        });
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (user.Role == UserRole.Admin)
        {
            var allUsers = await _userRepository.GetAllAsync();
            if (allUsers.Count(u => u.Role == UserRole.Admin) <= 1)
            {
                return BadRequest(new { message = "Cannot delete the last remaining Administrator account." });
            }
        }

        await _userRepository.DeleteAsync(userId);
        return Ok(new { message = "User deleted successfully." });
    }

    [HttpPut("users/email/{email}/toggle-active")]
    public async Task<IActionResult> ToggleUserActiveByEmail(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.IsActive = !user.IsActive;
        await _userRepository.UpdateAsync(user);

        return Ok(new
        {
            message = $"User status updated to {(user.IsActive ? "Active" : "Inactive")}.",
            email = user.Email,
            isActive = user.IsActive
        });
    }

    [HttpDelete("users/email/{email}")]
    public async Task<IActionResult> DeleteUserByEmail(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (user.Role == UserRole.Admin)
        {
            var allUsers = await _userRepository.GetAllAsync();
            if (allUsers.Count(u => u.Role == UserRole.Admin) <= 1)
            {
                return BadRequest(new { message = "Cannot delete the last remaining Administrator account." });
            }
        }

        await _userRepository.DeleteAsync(user.Id);
        return Ok(new { message = "User deleted successfully." });
    }
}
