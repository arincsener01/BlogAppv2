#nullable disable
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediatR;
using CORE.APP.Features;
using APP.BLOG.Features.Tags;

//Generated from Custom Template.
namespace API.BLOG.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        private readonly ILogger<TagsController> _logger;
        private readonly IMediator _mediator;

        public TagsController(ILogger<TagsController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        // GET: api/Tags
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _mediator.Send(new TagQueryRequest());
                var list = await response.ToListAsync();
                if (list.Any())
                    return Ok(list);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("TagsGet Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during TagsGet.")); 
            }
        }

        // GET: api/Tags/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var response = await _mediator.Send(new TagQueryRequest());
                var item = await response.SingleOrDefaultAsync(r => r.Id == id);
                if (item is not null)
                    return Ok(item);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("TagsGetById Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during TagsGetById.")); 
            }
        }

		// POST: api/Tags
        [HttpPost]
        public async Task<IActionResult> Post(TagCreateRequest request)
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
                    ModelState.AddModelError("TagsPost", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("TagsPost Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during TagsPost.")); 
            }
        }

        // PUT: api/Tags
        [HttpPut]
        public async Task<IActionResult> Put(TagUpdateRequest request)
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
                    ModelState.AddModelError("TagsPut", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("TagsPut Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during TagsPut.")); 
            }
        }

        // DELETE: api/Tags/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var response = await _mediator.Send(new TagDeleteRequest() { Id = id });
                if (response.Success)
                {
                    //return NoContent();
                    return Ok(response);
                }
                ModelState.AddModelError("TagsDelete", response.Message);
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("TagsDelete Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during TagsDelete.")); 
            }
        }
	}
}
