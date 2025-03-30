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
    public class SkillCreateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Skill name is required.")]
        [MaxLength(50, ErrorMessage = "Skill name cannot exceed 50 characters.")]
        public string Name { get; set; }
        public List<int> UserIds { get; set; }
    }
    public class SkillCreateHandler : BlogDbHandler, IRequestHandler<SkillCreateRequest, CommandResponse>
    {
        public SkillCreateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(SkillCreateRequest request, CancellationToken cancellationToken)
        {
            if (await _db.Skills.AnyAsync(s => s.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
            {
                return Error("A skill with the same name already exists.");
            }
            var entity = new Skill
            {
                Id = request.Id,
                Name = request.Name.Trim(),
                UserIds = request.UserIds
            };
            _db.Skills.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Skill created successfully.", entity.Id);
        }
    }
}
