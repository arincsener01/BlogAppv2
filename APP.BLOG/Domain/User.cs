using CORE.APP.Domain;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace APP.BLOG.Domain
{
    public class User : Entity
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [MinLength(4, ErrorMessage = "Username must be at least 4 characters long.")]
        [MaxLength(20, ErrorMessage = "Username cannot exceed 20 characters.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
        public string Password { get; set; }

        public bool IsActive { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(50, ErrorMessage = "Name cannot exceed 50 characters.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Surname is required.")]
        [MaxLength(50, ErrorMessage = "Surname cannot exceed 50 characters.")]
        public string Surname { get; set; }

        public DateTime RegistrationDate { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public int RoleId { get; set; }

        public Role Role { get; set; }

        public List<UserSkill> UserSkills { get; set; } = new List<UserSkill>();

        [NotMapped]
        public List<int> SkillIds
        {
            get => UserSkills.Select(userSkill => userSkill.SkillId).ToList();
            set => UserSkills = value.Select(v => new UserSkill() { SkillId = v }).ToList();
        }

    }
}
