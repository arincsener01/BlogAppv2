using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Blogs
{
    public class BlogDeleteRequest : Request, IRequest<CommandResponse>
    {
    }

    public class BlogDeleteHandler : BlogDbHandler, IRequestHandler<BlogDeleteRequest, CommandResponse>
    {
        public BlogDeleteHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(BlogDeleteRequest request, CancellationToken cancellationToken)
        {
            var entity = await _db.Blogs
                .Include(b => b.BlogTags)
                .SingleOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Blog not found!");

            // Remove related BlogTags first
            _db.BlogTags.RemoveRange(entity.BlogTags);

            // Then remove the Blog itself
            _db.Blogs.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Blog deleted successfully.", entity.Id);
        }
    }
}
