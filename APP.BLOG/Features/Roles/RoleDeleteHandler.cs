using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Roles
{
    public class RoleDeleteRequest : Request, IRequest<CommandResponse>
    {
        
    }
    public class RoleDeleteHandler : BlogDbHandler, IRequestHandler<RoleDeleteRequest, CommandResponse>
    {
        public RoleDeleteHandler(BlogDb db) : base(db)
        {
        }
        public async Task<CommandResponse> Handle(RoleDeleteRequest request, CancellationToken cancellationToken)
        {
            // might change
            var entity = await _db.Roles.Include(r => r.Users).SingleOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Role not found!");

            if (entity.Users.Any())
                return Error("Role cannot be deleted because it has relational users!");

            _db.Roles.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Role deleted successfully.", entity.Id);
        }
    }
}
