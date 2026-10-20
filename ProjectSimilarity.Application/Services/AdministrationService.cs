using ProjectSimilarity.Core.Entities;
using ProjectSimilarity.Core.Interfaces;

namespace ProjectSimilarity.Application.Services;

public sealed record RoleUpdateResult(bool Succeeded, string Message, UserRole? Role = null);

public sealed class AdministrationService
{
    private readonly IUserRepository _userRepository;

    public AdministrationService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<RoleUpdateResult> UpdateUserRoleAsync(Guid userId, UserRole newRole, Guid currentAdminId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return new(false, "User not found.");
        }

        if (userId == currentAdminId && newRole != UserRole.Admin)
        {
            return new(false, "You cannot remove your own Administrator role.");
        }

        if (user.Role == UserRole.Admin && newRole != UserRole.Admin)
        {
            var users = await _userRepository.GetAllAsync();
            if (users.Count(existingUser => existingUser.Role == UserRole.Admin) <= 1)
            {
                return new(false, "At least one Administrator account must remain.");
            }
        }

        user.Role = newRole;
        await _userRepository.UpdateAsync(user);
        return new(true, "User role updated successfully.", user.Role);
    }

    public async Task<bool> IsActiveAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user?.IsActive == true;
    }
}
