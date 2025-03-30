using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using CORE.APP.Features;
using MediatR;

namespace APP.BLOG.Features.Skills
{
    public class SkillQueryRequest : Request, IRequest<IQueryable<SkillQueryResponse>>
    {
    }

    public class SkillQueryResponse : QueryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<int> UserIds { get; set; }
    }
    public class SkillQueryHandler : BlogDbHandler, IRequestHandler<SkillQueryRequest, IQueryable<SkillQueryResponse>>
    {
        public SkillQueryHandler(BlogDb db) : base(db)
        {
        }

        public Task<IQueryable<SkillQueryResponse>> Handle(SkillQueryRequest request, CancellationToken cancellationToken)
        {
            var query = _db.Skills.OrderBy(s => s.Name).ThenByDescending(s => s.Id)
                .Select(s => new SkillQueryResponse()
                {
                    Id = s.Id,
                    Name = s.Name,
                    UserIds = s.UserIds
                });

            return Task.FromResult(query);
        }
    }
}
