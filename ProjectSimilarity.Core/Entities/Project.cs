namespace ProjectSimilarity.Core.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Domain { get; set; }
    public List<string> Technologies { get; set; }
    public string AcademicYear { get; set; }
    public Guid UploadedBy { get; set; }
    public User UploadedByUser { get; set; }
    public ProjectStatus Status { get; set; }
    public string FilePath { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum ProjectStatus { Pending, Approved, Flagged }