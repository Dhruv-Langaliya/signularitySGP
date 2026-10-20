using Microsoft.AspNetCore.Http;

namespace ProjectSimilarity.API.DTOs;

public class ProjectUploadDto
{
    public IFormFile File { get; set; } = default!;
    public string Title { get; set; } = null!;
    public string Domain { get; set; } = null!;
    public string AcademicYear { get; set; } = null!;
}