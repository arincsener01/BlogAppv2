using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Tags
{
    public class TagDeleteRequest : Request, IRequest<CommandResponse>
    {
    }
    public class TagDeleteHandler : BlogDbHandler, IRequestHandler<TagDeleteRequest, CommandResponse>
    {
        public TagDeleteHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(TagDeleteRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Tags.SingleOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Tag not found!");

            if (entity.BlogTags.Any())
            {
                return Error("Tag cannot be deleted because it has relational Blog Tags!");
            }

            _db.Tags.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Tag deleted successfully.", entity.Id);
        }
    }
}
