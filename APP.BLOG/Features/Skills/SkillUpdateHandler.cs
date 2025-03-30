using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Skills
{
    public class SkillUpdateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Skill name is required.")]
        [MaxLength(50, ErrorMessage = "Skill name cannot exceed 50 characters.")]
        public string Name { get; set; }
        public List<int> UserIds { get; set; }
    }
    public class SkillUpdateHandler : BlogDbHandler, IRequestHandler<SkillUpdateRequest, CommandResponse>
    {
        public SkillUpdateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(SkillUpdateRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Skills.SingleOrDefaultAsync(s => s.Id != request.Id, cancellationToken);
            
            if (entity is null)
                return Error("Skill not found!");

            if (await _db.Skills.AnyAsync(s => s.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
            {
                return Error("A skill with the same name already exists.");
            }

                entity.Name = request.Name.Trim();
            entity.UserIds = request.UserIds;

            _db.Skills.Update(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Skill updated successfully.", entity.Id);
        }
    }
}
