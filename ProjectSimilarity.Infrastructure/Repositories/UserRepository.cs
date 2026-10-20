using Microsoft.EntityFrameworkCore;
using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;
using ProjectSimilarity.Infrastructure.Data;

namespace ProjectSimilarity.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _context.Users.FirstOrDefaultAsync(user => user.Email.ToLower() == normalizedEmail);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(user => user.Id == id);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .OrderBy(user => user.Role)
            .ThenBy(user => user.Name)
            .ToListAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await GetByIdAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}