using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace APP.BLOG.Features.Tags
{
    public class TagQueryRequest : Request, IRequest<IQueryable<TagQueryResponse>>
    {
        public string Name { get; set; }

        //[JsonIgnore]
        //public override int Id { get => base.Id; set => base.Id = value; }
    }

    public class TagQueryResponse : QueryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public List<int> BlogIds { get; set; }

        public string BlogTitles { get; set; }
    }

    public class TagQueryHandler : BlogDbHandler, IRequestHandler<TagQueryRequest, IQueryable<TagQueryResponse>>
    {
        public TagQueryHandler(BlogDb db) : base(db)
        {
        }

        public Task<IQueryable<TagQueryResponse>> Handle(TagQueryRequest request, CancellationToken cancellationToken)
        {
            var entityQuery = _db.Tags
                .Include(tag => tag.BlogTags)
                    .ThenInclude(blogTag => blogTag.Blog)
                .OrderBy(t => t.Name)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                entityQuery = entityQuery.Where(t => t.Name.ToUpper().Contains(request.Name.ToUpper().Trim()));
            }

            var query = entityQuery.Select(tag => new TagQueryResponse
            {
                Id = tag.Id,
                Name = tag.Name,
                BlogIds = tag.BlogTags.Select(bt => bt.BlogId).ToList(),
                BlogTitles = string.Join(", ", tag.BlogTags.Select(bt => bt.Blog.Title))
            });

            return Task.FromResult(query);
        }
    }
}
