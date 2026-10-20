using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectSimilarity.API.Constants;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using ProjectSimilarity.MLEngine.Services;
using System.Security.Claims;

namespace ProjectSimilarity.API.Controllers;

[ApiController]
[Route(AuthConstants.SimilarityBaseRoute)]
public class SimilarityController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly ISimilarityRepository _similarityRepository;
    private readonly SimilarityService _similarityService;
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;

    public SimilarityController(
        IProjectRepository projectRepository,
        ISimilarityRepository similarityRepository,
        SimilarityService similarityService,
        IUserRepository userRepository,
        IWebHostEnvironment environment)
    {
        _projectRepository = projectRepository;
        _similarityRepository = similarityRepository;
        _similarityService = similarityService;
        _userRepository = userRepository;
        _environment = environment;
    }

    [HttpPost($"{AuthConstants.SimilarityRunRoute}/{{projectId:guid}}")]
    [Authorize(Roles = AuthConstants.FacultyAdminRoles)]
    public async Task<IActionResult> Run(Guid projectId)
    {
        var sourceProject = await _projectRepository.GetByIdAsync(projectId);
        if (sourceProject is null)
        {
            return NotFound();
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdValue, out var userId))
        {
            var currentUser = await _userRepository.GetByIdAsync(userId);
            if (currentUser is null || !currentUser.IsActive)
            {
                return Unauthorized(new { message = "This account is deactivated." });
            }
        }

        var allProjects = await _projectRepository.GetAllAsync();
        var comparisonProjects = allProjects
            .Where(project => project.Id != projectId)
            .Select(project => (project.Id, FilePath: ResolvePhysicalPath(project.FilePath)))
            .ToList();

        var sourceFilePath = ResolvePhysicalPath(sourceProject.FilePath);
        if (!System.IO.File.Exists(sourceFilePath))
        {
            return UnprocessableEntity(new { message = "The source project file is missing from storage." });
        }

        comparisonProjects = comparisonProjects
            .Where(project => System.IO.File.Exists(project.FilePath))
            .ToList();
        var results = await _similarityService.CompareWithAllAsync(sourceFilePath, comparisonProjects);

        foreach (var result in results)
        {
            await _similarityRepository.AddAsync(new SimilarityResult
            {
                Id = Guid.NewGuid(),
                SourceProjectId = projectId,
                MatchedProjectId = result.ProjectId,
                SimilarityScore = (decimal)result.Score,
                RiskLevel = Enum.TryParse<RiskLevel>(result.RiskLevel, true, out var parsedRiskLevel) ? parsedRiskLevel : RiskLevel.Low,
                ReportPath = string.Empty,
                CreatedAt = DateTime.UtcNow
            });
        }

        var response = results.Select(result => new
        {
            projectId = result.ProjectId,
            projectTitle = allProjects.FirstOrDefault(project => project.Id == result.ProjectId)?.Title,
            score = result.Score,
            riskLevel = result.RiskLevel
        });

        return Ok(response);
    }

    [HttpGet($"{AuthConstants.SimilarityResultsRoute}/{{projectId:guid}}")]
    [Authorize(Roles = AuthConstants.FacultyAdminRoles)]
    public async Task<IActionResult> GetResults(Guid projectId)
    {
        var results = await _similarityRepository.GetBySourceProjectAsync(projectId);

        return Ok(results.Select(result => new
        {
            result.Id,
            result.SourceProjectId,
            result.MatchedProjectId,
            matchedProjectTitle = result.MatchedProject?.Title,
            result.SimilarityScore,
            riskLevel = result.RiskLevel.ToString(),
            result.ReportPath,
            result.CreatedAt
        }));
    }

    private string ResolvePhysicalPath(string storedPath)
    {
        if (Path.IsPathRooted(storedPath))
        {
            return storedPath;
        }

        var relativePath = storedPath.Replace('/', Path.DirectorySeparatorChar);
        var privatePath = Path.Combine(_environment.ContentRootPath, "Data", relativePath);
        if (System.IO.File.Exists(privatePath))
        {
            return privatePath;
        }

        // Keep older records readable if startup migration could not move a file.
        var legacyWebRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        return Path.Combine(legacyWebRoot, relativePath);
    }
}