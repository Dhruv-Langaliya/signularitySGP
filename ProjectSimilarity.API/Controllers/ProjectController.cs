using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectSimilarity.API.Constants;
using ProjectSimilarity.API.DTOs;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using System.Security.Claims;

namespace ProjectSimilarity.API.Controllers;

[ApiController]
[Route(AuthConstants.ProjectBaseRoute)]
public class ProjectController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;

    public ProjectController(IProjectRepository projectRepository, IUserRepository userRepository, IWebHostEnvironment environment)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _environment = environment;
    }

    [HttpPost(AuthConstants.ProjectUploadRoute)]
    [Authorize(Roles = AuthConstants.StudentFacultyAdminRoles)]
    public async Task<IActionResult> Upload([FromForm] ProjectUploadDto dto)
    {
        if (dto is null || dto.File is null || dto.File.Length == 0 || string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Domain) || string.IsNullOrWhiteSpace(dto.AcademicYear))
        {
            return BadRequest(new { message = AuthConstants.ProjectUploadRequiredMessage });
        }

        var allowedExtensions = new[] { ".pdf", ".docx", ".cs", ".js", ".py", ".txt" };
        var extension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();
        if (dto.File.Length > AuthConstants.MaxProjectFileSize || !allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = AuthConstants.InvalidProjectFileMessage });
        }

        var userIdValue = User.FindFirstValue(AuthConstants.UserIdClaim) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var uploadedBy))
        {
            return Unauthorized(new { message = AuthConstants.InvalidUserTokenMessage });
        }

        var currentUser = await _userRepository.GetByIdAsync(uploadedBy);
        if (currentUser is null)
        {
            return Unauthorized(new { message = AuthConstants.InvalidUserTokenMessage });
        }

        if (!currentUser.IsActive)
        {
            return Unauthorized(new { message = "This account is deactivated." });
        }

        var uploadDirectory = Path.Combine(_environment.ContentRootPath, "Data", AuthConstants.UploadsFolderName);
        Directory.CreateDirectory(uploadDirectory);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.File.FileName)}";
        var physicalPath = Path.Combine(uploadDirectory, fileName);

        await using (var stream = System.IO.File.Create(physicalPath))
        {
            await dto.File.CopyToAsync(stream);
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Domain = dto.Domain.Trim(),
            Technologies = new List<string>(),
            AcademicYear = dto.AcademicYear.Trim(),
            UploadedBy = uploadedBy,
            UploadedByUser = currentUser,
            Status = ProjectStatus.Pending,
            FilePath = Path.Combine(AuthConstants.UploadsFolderName, fileName).Replace('\\', '/'),
            CreatedAt = DateTime.UtcNow
        };

        await _projectRepository.AddAsync(project);

        return Ok(new
        {
            projectId = project.Id,
            projectTitle = project.Title
        });
    }

    [HttpGet]
    [Authorize(Roles = AuthConstants.FacultyAdminRoles)]
    public async Task<IActionResult> GetAll([FromQuery] string? academicYear = null, [FromQuery] string? domain = null)
    {
        var projects = await _projectRepository.GetAllAsync(academicYear, domain);

        return Ok(projects.Select(project => new
        {
            project.Id,
            project.Title,
            project.Domain,
            project.Technologies,
            project.AcademicYear,
            project.UploadedBy,
            uploadedByName = project.UploadedByUser?.Name,
            project.Status,
            project.FilePath,
            project.CreatedAt
        }));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = AuthConstants.FacultyAdminRoles)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            project.Id,
            project.Title,
            project.Domain,
            project.Technologies,
            project.AcademicYear,
            project.UploadedBy,
            uploadedByName = project.UploadedByUser?.Name,
            project.Status,
            project.FilePath,
            project.CreatedAt
        });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AuthConstants.FacultyAdminRoles)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project is null)
        {
            return NotFound(new { message = "Project not found." });
        }

        // Delete physical file if it exists
        if (!string.IsNullOrWhiteSpace(project.FilePath))
        {
            var physicalPath = Path.Combine(_environment.ContentRootPath, "Data", project.FilePath.Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(physicalPath))
            {
                try
                {
                    System.IO.File.Delete(physicalPath);
                }
                catch
                {
                    // Ignore file deletion error to ensure DB record can still be deleted
                }
            }
        }

        await _projectRepository.DeleteAsync(id);
        return Ok(new { message = "Project submission deleted successfully.", projectId = id });
    }
}