using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace APP.BLOG.Features.Blogs
{
    public class BlogCreateRequest : Request, IRequest<CommandResponse>
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Content is required.")]
        [MinLength(20, ErrorMessage = "Content must be at least 20 characters long.")]
        public string Content { get; set; }

        [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
        public decimal? Rating { get; set; }

        [Required(ErrorMessage = "Publish date is required.")]
        public DateTime PublishDate { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        //[JsonIgnore]
        //public override int Id { get => base.Id; set => base.Id = value; }
    }

    public class BlogCreateHandler : BlogDbHandler, IRequestHandler<BlogCreateRequest, CommandResponse>
    {
        public BlogCreateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(BlogCreateRequest request, CancellationToken cancellationToken)
        {
            // Optional: Check for duplicate blog with same title and user
            if (await _db.Blogs.AnyAsync(b =>
                    b.Title.ToUpper() == request.Title.ToUpper().Trim() &&
                    b.UserId == request.UserId,
                    cancellationToken))
            {
                return Error("A blog with the same title already exists for this user.");
            }

            var entity = new Blog
            {
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Rating = request.Rating,
                PublishDate = request.PublishDate,
                UserId = request.UserId
            };

            _db.Blogs.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Blog created successfully.", entity.Id);
        }
    }
}
