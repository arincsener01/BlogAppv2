using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using APP.Users.Domain;
using APP.Users.Features.Roles;
using APP.Users.Features.Skills;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace APP.Users.Features.Users
{
    public class UserQueryRequest : Request, IRequest<IQueryable<UserQueryResponse>>
    {
    }

    public class UserQueryResponse : QueryResponse
    {
        [Required, StringLength(30, MinimumLength = 3)]
        public string UserName { get; set; }

        [Required, StringLength(10, MinimumLength = 3)]
        public string Password { get; set; }

        public bool IsActive { get; set; }

        public string Active { get; set; }

        [StringLength(50)]
        public string FirstName { get; set; }

        [StringLength(50)]
        public string LastName { get; set; }

        public string FullName { get; set; }

        public int RoleId { get; set; }


        //Way 1:
        public string RoleName { get; set; }


        //Way 2:
        public RoleQueryResponse Role { get; set; }

        public List<int> SkillIds { get; set; }

        //Way 1:
        public string SkillNames { get; set; }
        
        //Way 2:

        public List<SkillQueryResponse> Skills { get; set; }
    }
    public class UserQueryHandler : UsersDbHandler, IRequestHandler<UserQueryRequest, IQueryable<UserQueryResponse>>
    {
        public UserQueryHandler(UsersDb db) : base(db)
        {
        }

        public Task<IQueryable<UserQueryResponse>> Handle(UserQueryRequest request, CancellationToken cancellationToken)
        {
            var entityQuery = _db.Users.Include(u => u.Role).Include(u => u.UserSkills).ThenInclude(us => us.Skill).OrderByDescending(u => u.IsActive).ThenBy(u => u.UserName).AsQueryable();

            //Projection
            var query = entityQuery.Select(u => new UserQueryResponse()
            {
                Active = u.IsActive ? "Active" : "Not Active",
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = u.FirstName + " " + u.LastName,
                UserName = u.UserName,
                Id = u.Id,
                IsActive = u.IsActive,
                Password = u.Password,
                Role = new RoleQueryResponse()
                {
                    Name = u.Role.Name
                },
                RoleId = u.Role.Id,
                SkillIds = u.SkillIds,
                SkillNames = string.Join(", ", u.UserSkills.Select(us => us.Skill.Name)),

            });

            return Task.FromResult(query);
        }
    }
}
