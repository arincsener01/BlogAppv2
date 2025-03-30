using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using APP.BLOG.Features.Roles;
using APP.BLOG.Features.Skills;
using CORE.APP.Features;
using MediatR;

namespace APP.BLOG.Features.Users
{
    public class UserQueryRequest : Request, IRequest<IQueryable<UserQueryResponse>>
    {
    }

    public class UserQueryResponse : QueryResponse
    {
        public int Id { get; set; }

        public string UserName { get; set; }

        public string Password { get; set; }

        public bool IsActive { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public DateTime RegistrationDate { get; set; }

        public int RoleId { get; set; }

        public List<int> SkillIds { get; set; }

        public RoleQueryResponse Role { get; set; }
    }
    public class UserQueryHandler : BlogDbHandler, IRequestHandler<UserQueryRequest, IQueryable<UserQueryResponse>>
    {
        public UserQueryHandler(BlogDb db) : base(db)
        {
        }

        public Task<IQueryable<UserQueryResponse>> Handle(UserQueryRequest request, CancellationToken cancellationToken)
        {
            var query = _db.Users.OrderBy(u => u.UserName).ThenBy(u => u.RegistrationDate).ThenByDescending(u => u.IsActive)
                .Select(u => new UserQueryResponse()
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Password = u.Password,
                    IsActive = u.IsActive,
                    Name = u.Name,
                    Surname = u.Surname,
                    RegistrationDate = u.RegistrationDate,
                    RoleId = u.RoleId,
                    SkillIds = u.SkillIds,

                    Role = u.Role == null ? null : new RoleQueryResponse()
                    {
                        Name = u.Role.Name,
                        Id = u.Role.Id
                    }
                });
            
            return Task.FromResult(query);
        }
    }
}
