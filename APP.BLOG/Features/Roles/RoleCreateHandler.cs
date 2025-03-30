using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace APP.BLOG.Features.Roles
{
    public class RoleCreateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [MaxLength(30, ErrorMessage = "Role name cannot exceed 30 characters.")]
        public string Name { get; set; }
    }
    
    public class RoleCreateHandler : BlogDbHandler, IRequestHandler<RoleCreateRequest, CommandResponse>
    {
        public RoleCreateHandler(BlogDb db) : base(db)
        {
        }
        public async Task<CommandResponse> Handle(RoleCreateRequest request, CancellationToken cancellationToken)
        {
            // Optional: Check for duplicate role with same name
            if (await _db.Roles.AnyAsync(r => r.Name.ToUpper() == request.Name.ToUpper().Trim(), cancellationToken))
            {
                return Error("A role with the same name already exists.");
            }
            var entity = new Role
            {
                Name = request.Name.Trim(),
                Id = request.Id
            };
            _db.Roles.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Role created successfully.", entity.Id);
        }
    }
}
