using eTendering.Core.DTOs;
using eTendering.Core.Models;

namespace eTendering.Infrastructure.Service.Interface
{
    public interface ITenderService
    {
        Task<GenericResponseDto<IEnumerable<TenderHeaderDto>>> GetAllTenderHeadersAsync();
        Task<GenericResponseDto<List<CreatedTenderTemplateDto>>> CreateTenderAsync(CreateTenderRequestModel request);
        Task<GenericResponseDto<bool>> DeleteTenderTempByTenderTempIdAsync(Guid @TenderTempId);
        Task<GenericResponseDto<TenderTemplateResponseDto>> GetTenderTemplateByIdAsync(Guid id);
        Task<Guid> UpdateTenderTemplateAsync(UpdateTenderTemplateRequestDto request);
        //----------------TenderServices-----------------------------------------
        Task<(int totalRecords, GenericResponseDto<IEnumerable<TenderListDto>>)> GetTenderListAsync(int pageNumber, int pageSize);
        Task<GenericResponseDto<TenderDetailsResponseDto>> GetVendersBidByTenderId(Guid tenderId);
        Task<GenericResponseDto<TenderTempVendorResponseDto>> GetVendorResponseByTenderTemplarteHeaderIdAsync(Guid tenderTemplarteHeaderId);
        Task<GenericResponseDto<Guid>> UpsertVendorResponseAsync(UpsertTenderVendorResponseDto request);
        Task<GenericResponseDto<bool>> UpdateVendorBidSubmittedDateAsync(Guid tenderId);
    }
}
