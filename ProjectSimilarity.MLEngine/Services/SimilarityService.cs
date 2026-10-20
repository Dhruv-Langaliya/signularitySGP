using ProjectSimilarity.MLEngine.DTOs;
using System.Text.RegularExpressions;

namespace ProjectSimilarity.MLEngine.Services;

public class SimilarityService
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the", "a", "an", "is", "it", "in", "on", "at", "to", "for", "of", "and", "or", "but", "with",
        "this", "that", "are", "was", "were", "be", "been", "have", "has", "had", "by", "from", "as", "we",
        "our", "their", "which", "who", "will", "can", "all", "also", "more", "about", "using", "used",
        "system", "project", "data"
    };

    private readonly TextExtractorService _textExtractorService;

    public SimilarityService(TextExtractorService textExtractorService)
    {
        _textExtractorService = textExtractorService;
    }

    public string PreprocessText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text.ToLowerInvariant();
        normalized = Regex.Replace(normalized, "[^a-z0-9\\s]", " ");

        var words = normalized
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(word => !StopWords.Contains(word));

        return string.Join(' ', words);
    }

    public Dictionary<string, float> ComputeTfIdf(string text)
    {
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (words.Length == 0)
        {
            return new Dictionary<string, float>();
        }

        var totalWords = words.Length;
        return words
            .GroupBy(word => word)
            .ToDictionary(group => group.Key, group => group.Count() / (float)totalWords);
    }

    public float CosineSimilarity(Dictionary<string, float> vec1, Dictionary<string, float> vec2)
    {
        var commonTerms = vec1.Keys.Intersect(vec2.Keys);

        var dotProduct = commonTerms.Sum(term => vec1[term] * vec2[term]);
        var magnitude1 = MathF.Sqrt(vec1.Values.Sum(value => value * value));
        var magnitude2 = MathF.Sqrt(vec2.Values.Sum(value => value * value));

        if (magnitude1 == 0 || magnitude2 == 0)
        {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    public string GetRiskLevel(float score)
    {
        if (score < 0.40f)
        {
            return "Low";
        }

        if (score < 0.70f)
        {
            return "Medium";
        }

        return "High";
    }

    public Task<List<SimilarityResultDto>> CompareWithAllAsync(string newFilePath, List<(Guid id, string filePath)> existingProjects)
    {
        var newText = PreprocessText(_textExtractorService.ExtractText(newFilePath));
        var newVector = ComputeTfIdf(newText);

        var results = existingProjects
            .Select(project =>
            {
                var existingText = PreprocessText(_textExtractorService.ExtractText(project.filePath));
                var existingVector = ComputeTfIdf(existingText);
                var score = CosineSimilarity(newVector, existingVector);

                return new SimilarityResultDto
                {
                    ProjectId = project.id,
                    Score = score,
                    RiskLevel = GetRiskLevel(score)
                };
            })
            .OrderByDescending(result => result.Score)
            .ToList();

        return Task.FromResult(results);
    }
}