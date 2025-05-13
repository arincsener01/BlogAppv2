using APP.Users.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace APP.Users.Features.Users
{
    public class UserDeleteRequest : Request, IRequest<CommandResponse>
    {
        [Required(ErrorMessage = "User ID is required.")]
        public override int Id { get; set; }
    }

    public class UserDeleteHandler : UsersDbHandler, IRequestHandler<UserDeleteRequest, CommandResponse>
    {
        public UserDeleteHandler(UsersDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(UserDeleteRequest request, CancellationToken cancellationToken)
        {
            var user = await _db.Users
                .Include(u => u.UserSkills)
                .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

            if (user == null)
            {
                return Error("User not found.");
            }

            // If you have other related entities that should prevent deletion
            // Add those checks here

            // First remove any related UserSkill records
            _db.UserSkills.RemoveRange(user.UserSkills);

            // Then remove the user
            _db.Users.Remove(user);

            await _db.SaveChangesAsync(cancellationToken);

            return Success("User deleted successfully.");
        }
    }
}