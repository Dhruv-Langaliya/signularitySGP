using ProjectSimilarity.Core.Entities;

namespace ProjectSimilarity.Core.Interfaces;

public interface IProjectRepository
{
    Task<List<Project>> GetAllAsync(string? academicYear = null, string? domain = null);
    Task<Project?> GetByIdAsync(Guid id);
    Task AddAsync(Project project);
    Task DeleteAsync(Guid id);
}