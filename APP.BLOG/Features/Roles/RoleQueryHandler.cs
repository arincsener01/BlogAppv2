using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;

namespace APP.BLOG.Features.Roles
{
    public class RoleQueryRequest : Request, IRequest<IQueryable<RoleQueryResponse>>
    {
    }

    public class RoleQueryResponse : QueryResponse
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [MaxLength(30, ErrorMessage = "Role name cannot exceed 30 characters.")]
        public string Name { get; set; }
    }

    public class RoleQueryHandler : BlogDbHandler, IRequestHandler<RoleQueryRequest, IQueryable<RoleQueryResponse>>
    {
        public RoleQueryHandler(BlogDb db) : base(db)
        {
        }
        public Task<IQueryable<RoleQueryResponse>> Handle(RoleQueryRequest request, CancellationToken cancellationToken)
        {
            var query = _db.Roles.OrderBy(r => r.Name).ThenByDescending(r => r.Id)
                .Select(r => new RoleQueryResponse()
                {
                    Id = r.Id,
                    Name = r.Name
                });

            return Task.FromResult(query);
        }
    }
}
