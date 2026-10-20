namespace ProjectSimilarity.MLEngine.DTOs;

public class SimilarityResultDto
{
    public Guid ProjectId { get; set; }
    public float Score { get; set; }
    public string RiskLevel { get; set; } = null!;
}