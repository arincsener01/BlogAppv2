using APP.Users.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace APP.Users.Features.Users
{
    public class UserCreateRequest : Request, IRequest<CommandResponse>
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 30 characters.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(10, MinimumLength = 3, ErrorMessage = "Password must be between 3 and 10 characters.")]
        public string Password { get; set; }

        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string FirstName { get; set; }

        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Role ID is required.")]
        public int RoleId { get; set; }

        public List<int> SkillIds { get; set; } = new List<int>();

        public bool IsActive { get; set; } = true; // Default to active
    }

    public class UserCreateHandler : UsersDbHandler, IRequestHandler<UserCreateRequest, CommandResponse>
    {
        public UserCreateHandler(UsersDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(UserCreateRequest request, CancellationToken cancellationToken)
        {
            // Check if username already exists
            if (await _db.Users.AnyAsync(u =>
                    u.UserName.ToUpper() == request.UserName.ToUpper().Trim(),
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

            // Create new user entity
            var user = new User
            {
                UserName = request.UserName.Trim(),
                Password = request.Password, // Note: In a real app, this should be hashed
                FirstName = request.FirstName?.Trim(),
                LastName = request.LastName?.Trim(),
                RoleId = request.RoleId, // We're setting this without validation
                IsActive = request.IsActive,
                // User skills will be automatically mapped through the SkillIds property
                SkillIds = request.SkillIds
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("User created successfully.", user.Id);
        }
    }
}