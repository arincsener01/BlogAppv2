using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace APP.BLOG.Domain
{
    public class Tag
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tag name is required.")]
        [MaxLength(30, ErrorMessage = "Tag name cannot exceed 30 characters.")]
        public string Name { get; set; }

        public List<BlogTag> BlogTags { get; set; } = new List<BlogTag>();

        [NotMapped]
        public List<int> BlogIds
        {
            get => BlogTags.Select(blogTag => blogTag.BlogId).ToList();
            set => BlogTags = value.Select(v => new BlogTag() { BlogId = v }).ToList();
        }
    }
}
