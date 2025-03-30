using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Domain
{
    public class BlogDb : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<BlogTag> BlogTags { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<UserSkill> UserSkills { get; set; }
        public BlogDb(DbContextOptions<BlogDb> options) : base(options)
        {
        }
    }
}
