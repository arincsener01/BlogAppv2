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
    public class TagUpdateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tag name is required.")]
        [MaxLength(30, ErrorMessage = "Tag name cannot exceed 30 characters.")]
        public string Name { get; set; }
        public List<int> BlogIds { get; set; }
    }
    public class TagUpdateHandler : BlogDbHandler, IRequestHandler<TagUpdateRequest, CommandResponse>
    {
        public TagUpdateHandler(BlogDb db) : base(db)
        {
        }

        //public async Task<CommandResponse> Handle(TagUpdateRequest request, CancellationToken cancellationToken)
        //{
        //    var entity = await _db.Tags.Include(t => t.BlogTags).SingleOrDefaultAsync(t => t.Id != request.Id, cancellationToken);

        //    if (entity is null)
        //        return Error("Tag not found!");

        //    if (await _db.Tags.AnyAsync(t => t.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
        //    {
        //        return Error("A tag with the same name already exists.");
        //    }

        //    entity.Name = request.Name.Trim();
        //    entity.BlogIds = request.BlogIds;

        //    _db.Tags.Update(entity);
        //    await _db.SaveChangesAsync(cancellationToken);

        //    return Success("Tag0ated successfully.", entity.Id);
        //}
        public async Task<CommandResponse> Handle(TagUpdateRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Tags
                .Include(t => t.BlogTags)
                .SingleOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Tag not found!");

            if (await _db.Tags.AnyAsync(t => t.Id != request.Id && t.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
                return Error("A tag with the same name already exists.");

            _db.BlogTags.RemoveRange(entity.BlogTags);
            entity.Name = request.Name.Trim();
            entity.BlogIds = request.BlogIds;

            _db.Tags.Update(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Tag updated successfully.", entity.Id);
        }

    }
}
