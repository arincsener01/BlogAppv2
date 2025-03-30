using CORE.APP.Domain;
using System.ComponentModel.DataAnnotations;

namespace APP.BLOG.Domain
{
    public class BlogTag : Entity
    {
        //[Required]
        //[StringLength(100)]
        public int Id { get; set; }
        public int BlogId { get; set; }
        public int TagId { get; set; }
        public Blog Blog { get; set; }
        public Tag Tag { get; set; }
    }
}
