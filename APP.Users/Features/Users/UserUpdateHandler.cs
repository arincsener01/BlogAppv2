using APP.Users.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace APP.Users.Features.Users
{
    public class UserUpdateRequest : Request, IRequest<CommandResponse>
    {
        [Required(ErrorMessage = "User ID is required.")]
        public override int Id { get; set; }

        [StringLength(30, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 30 characters.")]
        public string UserName { get; set; }

        [StringLength(10, MinimumLength = 3, ErrorMessage = "Password must be between 3 and 10 characters.")]
        public string Password { get; set; }

        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string FirstName { get; set; }

        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string LastName { get; set; }

        public int? RoleId { get; set; }

        public List<int> SkillIds { get; set; }

        public bool? IsActive { get; set; }
    }

    public class UserUpdateHandler : UsersDbHandler, IRequestHandler<UserUpdateRequest, CommandResponse>
    {
        public UserUpdateHandler(UsersDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(UserUpdateRequest request, CancellationToken cancellationToken)
        {
            var user = await _db.Users
                .Include(u => u.UserSkills)
                .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

            if (user == null)
            {
                return Error("User not found.");
            }

            // Check if username is taken (by another user)
            if (!string.IsNullOrEmpty(request.UserName) &&
                await _db.Users.AnyAsync(u =>
                    u.UserName.ToUpper() == request.UserName.ToUpper().Trim() &&
                    u.Id != request.Id,
                    cancellationToken))
            {
                return Error("Username is already taken.");
            }

            // Note: We're not validating if role exists since there's no Roles DbSet in the context

            // Validate skills exist if any provided
            if (request.SkillIds?.Any() == true)
            {
                foreach (var skillId in request.SkillIds)
                {
                    if (!await _db.Skill.AnyAsync(s => s.Id == skillId, cancellationToken))
                    {
                        return Error($"Skill with ID {skillId} does not exist.");
                    }
                }
            }

            // Update user properties if provided
            if (!string.IsNullOrEmpty(request.UserName))
                user.UserName = request.UserName.Trim();

            if (!string.IsNullOrEmpty(request.Password))
                user.Password = request.Password; // Note: In a real app, this should be hashed

            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName.Trim();

            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName.Trim();

            if (request.RoleId.HasValue)
                user.RoleId = request.RoleId.Value;

            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;

            // Update skills if provided
            if (request.SkillIds != null)
            {
                user.SkillIds = request.SkillIds; // This will use the custom setter to update UserSkills
            }

            await _db.SaveChangesAsync(cancellationToken);
            return Success("User updated successfully.", user.Id);
        }
    }
}