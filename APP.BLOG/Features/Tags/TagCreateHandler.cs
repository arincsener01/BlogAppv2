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

namespace APP.BLOG.Features.Tags
{
    public class TagCreateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tag name is required.")]
        [MaxLength(30, ErrorMessage = "Tag name cannot exceed 30 characters.")]
        public string Name { get; set; }
        public List<int> BlogIds { get; set; }
    }
    public class TagCreateHandler : BlogDbHandler, IRequestHandler<TagCreateRequest, CommandResponse>
    {
        public TagCreateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(TagCreateRequest request, CancellationToken cancellationToken)
        {
            if (await _db.Tags.AnyAsync(t => t.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
            {
                return Error("A tag with the same name already exists.");
            }
            var entity = new Tag
            {
                Id = request.Id,
                Name = request.Name.Trim(),
                BlogIds = request.BlogIds
            };
            _db.Tags.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Tag created successfully.", entity.Id);
        }
    }
}
