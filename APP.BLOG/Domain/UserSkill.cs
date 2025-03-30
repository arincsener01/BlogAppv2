using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace APP.BLOG.Domain
{
    public class UserSkill
    {
        public int Id { get; set; }

        //[Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        //[Required(ErrorMessage = "SkillId is required.")]
        public int SkillId { get; set; }

        public User User { get; set; }
        public Skill Skill { get; set; }
    }

}
