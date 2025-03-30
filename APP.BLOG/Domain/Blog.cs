using CORE.APP.Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace APP.BLOG.Domain
{
    public class Blog : Entity
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [MinLength(5, ErrorMessage = "Title must be at least 5 characters long.")]
        [MaxLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Content is required.")]
        [MinLength(20, ErrorMessage = "Content must be at least 20 characters long.")]
        public string Content { get; set; }

        public decimal? Rating { get; set; }

        [Required(ErrorMessage = "Publish date is required.")]
        public DateTime PublishDate { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        public User User { get; set; }

        public List<BlogTag> BlogTags { get; set; } = new List<BlogTag>();
        
        //No need but a practical way
        [NotMapped]
        public List<int> TagIds 
        { 
            get => BlogTags.Select(blogTag => blogTag.TagId).ToList(); 
            set => BlogTags = value.Select(v => new BlogTag() { TagId = v }).ToList(); 
        }
    }
}