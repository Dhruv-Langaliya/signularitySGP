using Microsoft.EntityFrameworkCore;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using ProjectSimilarity.Infrastructure.Data;

namespace ProjectSimilarity.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Project project)
    {
        await _context.Projects.AddAsync(project);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Project>> GetAllAsync(string? academicYear = null, string? domain = null)
    {
        var query = _context.Projects
            .Include(project => project.UploadedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(academicYear))
        {
            query = query.Where(project => project.AcademicYear == academicYear);
        }

        if (!string.IsNullOrWhiteSpace(domain))
        {
            query = query.Where(project => project.Domain == domain);
        }

        return await query.OrderByDescending(project => project.CreatedAt).ToListAsync();
    }

    public async Task<Project?> GetByIdAsync(Guid id)
    {
        return await _context.Projects
            .Include(project => project.UploadedByUser)
            .FirstOrDefaultAsync(project => project.Id == id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is not null)
        {
            var relatedResults = await _context.SimilarityResults
                .Where(r => r.SourceProjectId == id || r.MatchedProjectId == id)
                .ToListAsync();
            
            if (relatedResults.Count > 0)
            {
                _context.SimilarityResults.RemoveRange(relatedResults);
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }
}