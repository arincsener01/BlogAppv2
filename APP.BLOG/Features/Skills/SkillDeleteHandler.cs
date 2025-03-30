using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Skills
{
    public class SkillDeleteRequest : Request, IRequest<CommandResponse>
    {

    }
    public class SkillDeleteHandler : BlogDbHandler, IRequestHandler<SkillDeleteRequest, CommandResponse>
    {
        public SkillDeleteHandler(BlogDb db) : base(db)
        {
        }
        public async Task<CommandResponse> Handle(SkillDeleteRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Skills.SingleOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Skill not found!");

            if (entity.UserSkills.Any())
            {
                return Error("Skill cannot be deleted because it has relational User Skills!");
            }

            _db.Skills.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);  

            return Success("Skill deleted successfully.", entity.Id);
        }
    }
}
