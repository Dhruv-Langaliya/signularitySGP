namespace ProjectSimilarity.Core.Entities;

public class SimilarityResult
{
    public Guid Id { get; set; }
    public Guid SourceProjectId { get; set; }
    public Project SourceProject { get; set; }
    public Guid MatchedProjectId { get; set; }
    public Project MatchedProject { get; set; }
    public decimal SimilarityScore { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public string ReportPath { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum RiskLevel { Low, Medium, High }