using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using CORE.APP.Domain;

namespace APP.Users.Domain
{
    public class User : Entity 
    {
        [Required, StringLength(30, MinimumLength = 3)]
        public string UserName { get; set; }

        [Required, StringLength(10, MinimumLength = 3)]
        public string Password { get; set; }

        public bool IsActive { get; set; }

        [StringLength(50)]
        public string FirstName { get; set; }

        [StringLength(50)]
        public string LastName { get; set; }


        public int RoleId { get; set; }

        public Role Role { get; set; }

        public List<UserSkill> UserSkills { get; set; } = new List<UserSkill>();

        [NotMapped]
        public List<int> SkillIds
        {
            get => UserSkills?.Select(us => us.SkillId).ToList(); 
            set => UserSkills = value?.Select(v => new UserSkill() { SkillId = v }).ToList();
        }
    }
}
