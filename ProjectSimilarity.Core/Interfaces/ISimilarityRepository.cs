using ProjectSimilarity.Core.Entities;

namespace ProjectSimilarity.Core.Interfaces;

public interface ISimilarityRepository
{
    Task<List<SimilarityResult>> GetBySourceProjectAsync(Guid sourceProjectId);
    Task AddAsync(SimilarityResult result);
}