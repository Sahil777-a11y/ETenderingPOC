using eTendering.Core.DTOs;
using eTendering.Infrastructure.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace eTendering.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplateController(ITemplateService _templateService) : ControllerBase
    {
        [HttpGet("GetAllTemplates")]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                var result = await _templateService.GetAllTemplatesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpGet("GetTemplateByTemplateId")]
        public async Task<IActionResult> GetTemplateByTemplateId(Guid templateId)
        {
            try
            {
                var result = await _templateService.GetTemplateByTemplateIdAsync(templateId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }


        [HttpGet("GetAllTemplateTypes")]
        public async Task<IActionResult> GetAllTemplateTypes()
        {
            try
            {
                var result = await _templateService.GetAllTemplateTypesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("UpsertTemplate")]
        public async Task<IActionResult> UpsertTemplate([FromBody] InsertTemplateRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Request body cannot be null.");

                var isUpdate = request.TemplateId.HasValue && request.TemplateId != Guid.Empty;

                var templateId = await _templateService.UpsertTemplateAsync(request);

                return Ok(new
                {
                    TemplateId = templateId,
                    Message = isUpdate
                        ? "Template updated successfully."
                        : "Template created successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("DeleteTemplateByTemplateId")]
        public async Task<IActionResult> DeleteTemplateByTemplateId(Guid templateId)
        {
            try
            {
                var result = await _templateService.DeleteTemplateByTemplateIdAsync(templateId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

    }
}
