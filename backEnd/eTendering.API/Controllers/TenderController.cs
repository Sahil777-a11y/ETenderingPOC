using eTendering.Core.DTOs;
using eTendering.Core.Models;
using eTendering.Infrastructure.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace ETendering.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenderController(ITenderService _tenderService,IUserClaimService _userClaimService) : ControllerBase
    {
        [HttpGet("GetAllTenders")]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                var result = await _tenderService.GetAllTenderHeadersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("CreateTender")]
        public async Task<IActionResult> CreateTender(CreateTenderRequestModel request)
        {
            try
            {
                var result = await _tenderService.CreateTenderAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }


        [HttpGet("GetTenderTemplateForPreview")]
        public async Task<IActionResult> GetTenderTemplateForPreview(Guid tenderTempId)
        {
            try
            {
                var result = await _tenderService.GetTenderTemplateByIdAsync(tenderTempId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }


        [HttpPost("DeleteTenderTemplateById")]
        public async Task<IActionResult> DeleteTemplateByTemplateId(Guid tenderTempId)
        {
            try
            {
                var result = await _tenderService.DeleteTenderTempByTenderTempIdAsync(tenderTempId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }



        [HttpPost("UpdateTenderTemplate")]
        public async Task<IActionResult> UpsertTemplate([FromBody] UpdateTenderTemplateRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Request body cannot be null.");

                var tenderTemplateId = await _tenderService.UpdateTenderTemplateAsync(request);

                return Ok(new
                {
                    TenderTemplateId = tenderTemplateId,
                    Message =  "Template updated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpGet("GetTendersForVendor")]
        public async Task<IActionResult> GetTendersForVendor(int pageNumber, int pageSize)
        {
            try
            {
                var (totalRecords, items) = await _tenderService.GetTenderListAsync(pageNumber, pageSize);
                var finalResponse = new
                {
                    TotalRecords = totalRecords,
                    items.Id,
                    items.Success,
                    items.Message,
                    items.Data,
                    items.MetaData
                };
                return Ok(finalResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpGet("GetVendersBidByTenderId")]
        public async Task<IActionResult> GetVendersBidByTenderId(Guid tenderId )
        {
            try
            {
                //var vendorIdString = _userClaimService.GetObjectId(User);
                //if (!Guid.TryParse(vendorIdString, out Guid vendorId))
                //    return BadRequest("Invalid VendorId format in token.");

                var finalResponse = await _tenderService.GetVendersBidByTenderId(tenderId);
               
                return Ok(finalResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpGet("GetVendorResponseByTenderTemplateHeaderId")]
        public async Task<IActionResult> GetVendorResponseByTenderTemplateHeaderId(Guid tenderTemplateHeaderId)
        {
            try
            {
                var finalResponse = await _tenderService.GetVendorResponseByTenderTemplarteHeaderIdAsync(tenderTemplateHeaderId);

                return Ok(finalResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("UpsertVendorResponseDetails")]
        public async Task<IActionResult> UpsertVendorResponseDetails(UpsertTenderVendorResponseDto request)
        {
            try
            {
                var finalResponse = await _tenderService.UpsertVendorResponseAsync(request);

                return Ok(finalResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("UpdateTendorSubmitStatus")]
        public async Task<IActionResult> UpdateTendorSubmitStatus(Guid tenderId)
        {
            try
            {
                var finalResponse = await _tenderService.UpdateVendorBidSubmittedDateAsync(tenderId);

                return Ok(finalResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }


    }
}
