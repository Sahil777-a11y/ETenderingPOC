using eTendering.Core.DTOs;
using eTendering.Core.Models;

namespace eTendering.Infrastructure.Service.Interface
{
    public interface ITemplateService
    {
        Task<GenericResponseDto<IEnumerable<TemplateDto>>> GetAllTemplatesAsync();
        Task<GenericResponseDto<TemplateDto>> GetTemplateByTemplateIdAsync(Guid templateId);
        Task<GenericResponseDto<IEnumerable<TemplateTypeModel>>> GetAllTemplateTypesAsync();
        Task<GenericResponseDto<bool>> DeleteTemplateByTemplateIdAsync(Guid templateId);
        Task<Guid> UpsertTemplateAsync(InsertTemplateRequestDto request);
    }
}
