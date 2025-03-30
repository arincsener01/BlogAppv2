using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace APP.BLOG.Domain
{
    public class Skill
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Skill name is required.")]
        [MaxLength(50, ErrorMessage = "Skill name cannot exceed 50 characters.")]
        public string Name { get; set; }
        public List<UserSkill> UserSkills { get; set; } = new List<UserSkill>();

        [NotMapped]
        public List<int> UserIds
        {
            get => UserSkills.Select(userSkill => userSkill.UserId).ToList();
            set => UserSkills = value.Select(v => new UserSkill() { UserId = v }).ToList();
        }
    }
}
