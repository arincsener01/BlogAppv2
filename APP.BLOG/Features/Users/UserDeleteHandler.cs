using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Users
{
    public class  UserDeleteRequest : Request, IRequest<CommandResponse>
    {
    }
    public class UserDeleteHandler : BlogDbHandler, IRequestHandler<UserDeleteRequest, CommandResponse>
    {
        public UserDeleteHandler(BlogDb db) : base(db)
        {
        }
        public async Task<CommandResponse> Handle(UserDeleteRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Users.SingleOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("User not found!");

            if (entity.UserSkills.Any())
            {
                return Error("User cannot be deleted because it has relational User Skills!");
            }

            _db.Users.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("User deleted successfully.", entity.Id);
        }
    }
}
