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
using System.Xml.Linq;

namespace APP.BLOG.Features.Roles
{
    public class RoleUpdateRequest : Request, IRequest<CommandResponse>
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [MaxLength(30, ErrorMessage = "Role name cannot exceed 30 characters.")]
        public string Name { get; set; }
    }
    
    public class RoleUpdateHandler : BlogDbHandler, IRequestHandler<RoleUpdateRequest, CommandResponse>
    {
        public RoleUpdateHandler(BlogDb db) : base(db)
        {
        }
        public async Task<CommandResponse> Handle(RoleUpdateRequest request, CancellationToken cancellationToken)
        {
            //Way 1:
            //var entity = new Role
            //{
            //    Name = request.Name.Trim(),
            //    Id = request.Id
            //};

            //Way 2:
            //var entity = await _db.Roles.FindAsync(request.Id, cancellationToken);

            if (await _db.Roles.AnyAsync(r => r.Name.ToUpper() == request.Name.ToUpper().Trim() && r.Id != request.Id, cancellationToken))
            {
                return Error("A role with the same name and ID already exists.");
            }

            //Way 3:
            var entity = await _db.Roles.SingleOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
            
            if (entity is null)
                return Error("Role not found!");

            entity.Name = request.Name.Trim();

            _db.Roles.Update(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Success("Role updated successfully.", entity.Id);
        }
    }
}
