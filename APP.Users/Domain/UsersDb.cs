using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace APP.Users.Domain
{
    public class UsersDb : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Skill> Skill { get; set; } 
        public DbSet<UserSkill> UserSkills { get; set; }

        public UsersDb(DbContextOptions option) : base(option)
        {
        }
    }
}
