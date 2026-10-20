using Microsoft.EntityFrameworkCore;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using ProjectSimilarity.Infrastructure.Data;

namespace ProjectSimilarity.Infrastructure.Repositories;

public class SimilarityRepository : ISimilarityRepository
{
    private readonly AppDbContext _context;

    public SimilarityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SimilarityResult result)
    {
        await _context.SimilarityResults.AddAsync(result);
        await _context.SaveChangesAsync();
    }

    public async Task<List<SimilarityResult>> GetBySourceProjectAsync(Guid sourceProjectId)
    {
        return await _context.SimilarityResults
            .Include(result => result.SourceProject)
            .Include(result => result.MatchedProject)
            .Where(result => result.SourceProjectId == sourceProjectId)
            .OrderByDescending(result => result.SimilarityScore)
            .ToListAsync();
    }
}