using CORE.APP.Domain;
using System.ComponentModel.DataAnnotations;


namespace APP.BLOG.Domain
{
    public class Role : Entity
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [MaxLength(30, ErrorMessage = "Role name cannot exceed 30 characters.")]
        public string Name { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}