using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace APP.BLOG.Features.Blogs
{
    public class BlogUpdateRequest : Request, IRequest<CommandResponse>
    {
        [Required(ErrorMessage = "Title is required.")]
        [MinLength(5, ErrorMessage = "Title must be at least 5 characters.")]
        [MaxLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Content is required.")]
        [MinLength(20, ErrorMessage = "Content must be at least 20 characters.")]
        public string Content { get; set; }

        [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
        public decimal? Rating { get; set; }

        [Required(ErrorMessage = "Publish date is required.")]
        public DateTime PublishDate { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        public List<int> TagIds { get; set; } = new();
    }

    public class BlogUpdateHandler : BlogDbHandler, IRequestHandler<BlogUpdateRequest, CommandResponse>
    {
        public BlogUpdateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(BlogUpdateRequest request, CancellationToken cancellationToken)
        {
            if (await _db.Blogs.AnyAsync(b => b.Id != request.Id &&
                                              b.Title.ToUpper() == request.Title.ToUpper().Trim() &&
                                              b.UserId == request.UserId,
                                              cancellationToken))
            {
                return Error("Another blog with the same title exists for this user.");
            }

            var entity = await _db.Blogs
                .Include(b => b.BlogTags)
                .SingleOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

            if (entity is null)
                return Error("Blog not found!");

            var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken);
            if (!userExists)
                return Error("Specified user does not exist.");

            _db.BlogTags.RemoveRange(entity.BlogTags);

            entity.Title = request.Title.Trim();
            entity.Content = request.Content.Trim();
            entity.Rating = request.Rating;
            entity.PublishDate = request.PublishDate;
            entity.UserId = request.UserId;
            entity.TagIds = request.TagIds;

            _db.Blogs.Update(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Blog updated successfully.", entity.Id);
        }
    }
}
