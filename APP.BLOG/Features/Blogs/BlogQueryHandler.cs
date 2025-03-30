using APP.BLOG.Domain;
using APP.BLOG.Features.Users;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace APP.BLOG.Features.Blogs
{
    public class BlogQueryRequest : Request, IRequest<IQueryable<BlogQueryResponse>>
    {
        public string Title { get; set; }
        public int? UserId { get; set; }
        public DateTime? PublishDateStart { get; set; }
        public DateTime? PublishDateEnd { get; set; }

        //[JsonIgnore]
        //public override int Id { get => base.Id; set => base.Id = value; }
    }

    public class BlogQueryResponse : QueryResponse
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public decimal? Rating { get; set; }
        public DateTime PublishDate { get; set; }

        public int UserId { get; set; }
        public string UserFullName { get; set; }

        public List<int> TagIds { get; set; }
        public string TagNames { get; set; }

        public UserQueryResponse User { get; set; }
    }

    public class BlogQueryHandler : BlogDbHandler, IRequestHandler<BlogQueryRequest, IQueryable<BlogQueryResponse>>
    {
        public BlogQueryHandler(BlogDb db) : base(db)
        {
        }

        public Task<IQueryable<BlogQueryResponse>> Handle(BlogQueryRequest request, CancellationToken cancellationToken)
        {
            var entityQuery = _db.Blogs
                .Include(b => b.User)
                .Include(b => b.BlogTags)
                    .ThenInclude(bt => bt.Tag)
                .OrderByDescending(b => b.PublishDate)
                .AsQueryable();

            // Filters
            if (!string.IsNullOrWhiteSpace(request.Title))
                entityQuery = entityQuery.Where(b => b.Title.ToUpper().Contains(request.Title.ToUpper().Trim()));

            if (request.UserId.HasValue)
                entityQuery = entityQuery.Where(b => b.UserId == request.UserId.Value);

            if (request.PublishDateStart.HasValue)
                entityQuery = entityQuery.Where(b => b.PublishDate >= request.PublishDateStart.Value);

            if (request.PublishDateEnd.HasValue)
                entityQuery = entityQuery.Where(b => b.PublishDate <= request.PublishDateEnd.Value);

            // Projection
            var query = entityQuery.Select(b => new BlogQueryResponse
            {
                Id = b.Id,
                Title = b.Title,
                Content = b.Content,
                Rating = b.Rating,
                PublishDate = b.PublishDate,
                UserId = b.UserId,
                UserFullName = b.User.Name + " " + b.User.Surname,
                TagIds = b.BlogTags.Select(bt => bt.TagId).ToList(),
                TagNames = string.Join(", ", b.BlogTags.Select(bt => bt.Tag.Name)),

                User = b.User == null ? null : new UserQueryResponse()
                {
                    Name = b.User.Name,
                    UserName = b.User.UserName
                    //RegistrationDate = b.User.RegistrationDate,
                    //IsActive = b.User.IsActive,
                    //RoleId = b.User.RoleId,
                    //Surname = b.User.Surname,
                }
            });

            return Task.FromResult(query);
        }
    }
}
