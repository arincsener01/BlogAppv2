using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.BLOG.Features.Users
{
    public class UserCreateRequest : Request, IRequest<CommandResponse>
    {
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

        [NotMapped]
        public List<int> SkillIds { get; set; }
    }
    public class UserCreateHandler : BlogDbHandler, IRequestHandler<UserCreateRequest, CommandResponse>
    {
        public UserCreateHandler(BlogDb db) : base(db)
        {
        }

        public async Task<CommandResponse> Handle(UserCreateRequest request, CancellationToken cancellationToken)
        {
            if (await _db.Users.AnyAsync(u => u.UserName.ToUpper() == request.UserName.ToUpper().Trim(), cancellationToken))
            {
                return Error("A user with the same username already exists.");
            }
            var entity = new User
            {
                UserName = request.UserName,
                Password = request.Password,
                IsActive = request.IsActive,
                Name = request.Name,
                Surname = request.Surname,
                RegistrationDate = request.RegistrationDate,
                RoleId = request.RoleId,
                SkillIds = request.SkillIds
            };
            _db.Users.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("User created successfully.", entity.Id);
        }
    }
}
