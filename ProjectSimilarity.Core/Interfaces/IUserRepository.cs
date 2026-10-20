using ProjectSimilarity.Core.Entities;

namespace ProjectSimilarity.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<List<User>> GetAllAsync();
    Task UpdateAsync(User user);
    Task AddAsync(User user);
    Task DeleteAsync(Guid id);
}