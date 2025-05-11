using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CORE.APP.Domain;

namespace APP.Users.Domain
{
    public class Skill : Entity
    {
        [Required]
        public string Name { get; set; }

        public List<UserSkill> UserSkills { get; set; } = new List<UserSkill>();

        [NotMapped]
        public List<int> UserIds
        {
            get => UserSkills?.Select(us => us.UserId).ToList();
            set => UserSkills = value?.Select(v => new UserSkill() { UserId = v }).ToList();
        }
    }
}
