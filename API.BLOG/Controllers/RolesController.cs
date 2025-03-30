#nullable disable
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediatR;
using CORE.APP.Features;
using APP.BLOG.Features.Roles;

//Generated from Custom Template.
namespace API.BLOG.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ILogger<RolesController> _logger;
        private readonly IMediator _mediator;

        public RolesController(ILogger<RolesController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        // GET: api/Roles
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _mediator.Send(new RoleQueryRequest());
                var list = await response.ToListAsync();
                if (list.Any())
                    return Ok(list);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("RolesGet Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during RolesGet.")); 
            }
        }

        // GET: api/Roles/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var response = await _mediator.Send(new RoleQueryRequest());
                var item = await response.SingleOrDefaultAsync(r => r.Id == id);
                if (item is not null)
                    return Ok(item);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("RolesGetById Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during RolesGetById.")); 
            }
        }

		// POST: api/Roles
        [HttpPost]
        public async Task<IActionResult> Post(RoleCreateRequest request)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var response = await _mediator.Send(request);
                    if (response.Success)
                    {
                        //return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
                        return Ok(response);
                    }
                    ModelState.AddModelError("RolesPost", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("RolesPost Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during RolesPost.")); 
            }
        }

        // PUT: api/Roles
        [HttpPut]
        public async Task<IActionResult> Put(RoleUpdateRequest request)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var response = await _mediator.Send(request);
                    if (response.Success)
                    {
                        //return NoContent();
                        return Ok(response);
                    }
                    ModelState.AddModelError("RolesPut", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("RolesPut Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during RolesPut.")); 
            }
        }

        // DELETE: api/Roles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var response = await _mediator.Send(new RoleDeleteRequest() { Id = id });
                if (response.Success)
                {
                    //return NoContent();
                    return Ok(response);
                }
                ModelState.AddModelError("RolesDelete", response.Message);
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("RolesDelete Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during RolesDelete.")); 
            }
        }
	}
}
