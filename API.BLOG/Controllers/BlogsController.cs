#nullable disable
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediatR;
using CORE.APP.Features;
using APP.BLOG.Features.Blogs;
using Microsoft.AspNetCore.Authorization;

//Generated from Custom Template.
namespace API.BLOG.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BlogsController : ControllerBase
    {
        private readonly ILogger<BlogsController> _logger;
        private readonly IMediator _mediator;

        public BlogsController(ILogger<BlogsController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        // GET: api/Blogs
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _mediator.Send(new BlogQueryRequest());
                var list = await response.ToListAsync();
                if (list.Any())
                    return Ok(list);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("BlogsGet Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during BlogsGet.")); 
            }
        }

        // GET: api/Blogs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var response = await _mediator.Send(new BlogQueryRequest());
                var item = await response.SingleOrDefaultAsync(r => r.Id == id);
                if (item is not null)
                    return Ok(item);
                return NoContent();
            }
            catch (Exception exception)
            {
                _logger.LogError("BlogsGetById Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during BlogsGetById.")); 
            }
        }

		// POST: api/Blogs
        [HttpPost]
        public async Task<IActionResult> Post(BlogCreateRequest request)
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
                    ModelState.AddModelError("BlogsPost", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                // Log more detailed error information
                _logger.LogError("BlogsPost Exception: {Message}", exception.Message);
                _logger.LogError("Exception stack trace: {StackTrace}", exception.StackTrace);
                
                if (exception.InnerException != null)
                {
                    _logger.LogError("Inner exception: {InnerMessage}", exception.InnerException.Message);
                    _logger.LogError("Inner exception stack trace: {InnerStackTrace}", exception.InnerException.StackTrace);
                }
                
                // Include more details in the error response for debugging
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new CommandResponse(false, $"An exception occurred during BlogsPost: {exception.Message}")); 
            }
        }

        // PUT: api/Blogs
        [HttpPut]
        public async Task<IActionResult> Put(BlogUpdateRequest request)
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
                    ModelState.AddModelError("BlogsPut", response.Message);
                }
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("BlogsPut Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during BlogsPut.")); 
            }
        }

        // DELETE: api/Blogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var response = await _mediator.Send(new BlogDeleteRequest() { Id = id });
                if (response.Success)
                {
                    //return NoContent();
                    return Ok(response);
                }
                ModelState.AddModelError("BlogsDelete", response.Message);
                return BadRequest(new CommandResponse(false, string.Join("|", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));
            }
            catch (Exception exception)
            {
                _logger.LogError("BlogsDelete Exception: " + exception.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new CommandResponse(false, "An exception occured during BlogsDelete.")); 
            }
        }
	}
}
