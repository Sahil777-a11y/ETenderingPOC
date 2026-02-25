using eTendering.Core.DTOs;
using eTendering.Core.Helpers;
using eTendering.Core.Models;
using eTendering.Infrastructure.Repository.Interface;
using eTendering.Infrastructure.Service.Interface;
using Newtonsoft.Json;
using System.Text.Json;

namespace eTendering.Infrastructure.Service
{
    public class TemplateService(IGenericRepo<TemplateHeaderModel> _repo) : ITemplateService
    {
        public async Task<GenericResponseDto<IEnumerable<TemplateDto>>> GetAllTemplatesAsync()
        {
            try
            {
                var flatData = await _repo.QueryCustomListAsync<TemplateFlatDto>("dbo.sp_GetAllTemplates");

                if (flatData == null || !flatData.Any())
                    return ResponseFactory.Failure<IEnumerable<TemplateDto>>("Templates not found");

                var groupedData = flatData
                    .GroupBy(x => x.TemplateId)
                    .Select(template => new TemplateDto
                    {
                        TemplateId = template.Key,
                        TemplateName = template.First().TemplateName,
                        Description = template.First().Description,
                        TypeId = template.First().TypeId,
                        TypeName = template.First().TypeName,
                        IsDeleted = template.First().IsDeleted,
                        TemplateCreatedDateTime = template.First().TemplateCreatedDateTime,
                        TemplateModifiedDateTime = template.First().TemplateModifiedDateTime,

                        Sections = template
                            .Where(s => s.SectionUniqueId != null)
                            .Select(s => new TemplateSectionDto
                            {
                                SectionUniqueId = s.SectionUniqueId.Value,
                                SectionId = s.SectionId ?? 0,
                                Title = s.Title,
                                Content = s.Content,
                                ResponseType = s.ResponseType,
                                SectionOrder = s.SectionOrder,
                                Properties = s.Properties,
                                AcknowledgementStatement = s.AcknowledgementStatement,
                                SectionCreatedDateTime = s.SectionCreatedDateTime,
                                SectionModifiedDateTime = s.SectionModifiedDateTime
                            })
                            .OrderBy(s => s.SectionOrder)
                            .ToList()
                    });


                return ResponseFactory.Success(groupedData, "Templates fetched successfully");
            }

            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<TemplateDto>> GetTemplateByTemplateIdAsync(Guid templateId)
        {
            try
            {
                var flatData = await _repo.QueryCustomListAsync<TemplateFlatDto>(
                    "dbo.sp_GetTemplateByTemplateId",
                    new { TemplateId = templateId });

                if (flatData == null || !flatData.Any())
                    return ResponseFactory.Failure<TemplateDto>("Template not found");

                var template = flatData
                    .GroupBy(x => x.TemplateId)
                    .Select(template => new TemplateDto
                    {
                        TemplateId = template.Key,
                        TemplateName = template.First().TemplateName,
                        Description = template.First().Description,
                        TypeId = template.First().TypeId,
                        TypeName = template.First().TypeName,
                        IsDeleted = template.First().IsDeleted,
                        TemplateCreatedDateTime = template.First().TemplateCreatedDateTime,
                        TemplateModifiedDateTime = template.First().TemplateModifiedDateTime,

                        Sections = template
                            .Where(s => s.SectionUniqueId != null)
                            .Select(s => new TemplateSectionDto
                            {
                                SectionUniqueId = s.SectionUniqueId.Value,
                                SectionId = s.SectionId ?? 0,
                                Title = s.Title,
                                Content = s.Content,
                                ResponseType = s.ResponseType,
                                SectionOrder = s.SectionOrder,
                                Properties = s.Properties,
                                AcknowledgementStatement = s.AcknowledgementStatement,
                                SectionCreatedDateTime = s.SectionCreatedDateTime,
                                SectionModifiedDateTime = s.SectionModifiedDateTime
                            })
                            .OrderBy(s => s.SectionOrder)
                            .ToList()
                    })
                    .FirstOrDefault();

                return ResponseFactory.Success(template, "Template fetched successfully");
            }
            catch
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<IEnumerable<TemplateTypeModel>>> GetAllTemplateTypesAsync()
        {
            try
            {
                var response = await _repo.QueryCustomListAsync<TemplateTypeModel>("dbo.sp_GetAllTemplateTypes");

                if (response == null || !response.Any())
                {
                    return ResponseFactory.Failure<IEnumerable<TemplateTypeModel>>("TemplateTypes not found");
                }

                return ResponseFactory.Success(response, "TemplateTypes fetched successfully");
            }

            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<bool>> DeleteTemplateByTemplateIdAsync(Guid templateId)
        {
            try
            {
                var result = await _repo.QueryCustomSingleAsync<int>(
                    "dbo.sp_DeleteTemplateByTemplateId", new { TemplateId = templateId });

                if (result > 0)
                {
                    return ResponseFactory.Success(true, "Template deleted successfully");
                }

                return ResponseFactory.Failure<bool>("Template not found or already deleted");
            }
            catch
            {
                throw;
            }
        }

        public async Task<Guid> UpsertTemplateAsync(InsertTemplateRequestDto request)
        {
            try
            {
                ValidateTemplate(request);

                var jsonSections = JsonConvert.SerializeObject(request.Sections);

                var templateId = await _repo.QueryCustomSingleAsync<Guid>("dbo.sp_InsertTemplateWithSections", new
                    {
                        request.TemplateId,
                        request.Name,
                        request.Description,
                        request.TypeId,
                        Sections = jsonSections
                    });

                return templateId;
            }
            catch
            {
                throw;
            }
        }





        #region Private Functions
        private void ValidateTemplate(InsertTemplateRequestDto request)
        {
            foreach (var section in request.Sections)
            {
                switch (section.SectionTypeId)
                {
                    case 10:
                        if (string.IsNullOrWhiteSpace(section.Title) ||
                            string.IsNullOrWhiteSpace(section.Content))
                        {
                            throw new Exception("For SectionType 10, Title and Content are required.");
                        }
                        break;

                    case 20:
                        if (string.IsNullOrWhiteSpace(section.Content) ||
                            section.ResponseType == null ||
                            section.Properties == null)
                        {
                            throw new Exception("For SectionType 20, Content, ResponseType and Properties are required.");
                        }

                        ValidateResponseType(section);
                        break;

                    case 30:
                        if (string.IsNullOrWhiteSpace(section.Content) ||
                            section.AcknowledgementStatement == null)
                        {
                            throw new Exception("For SectionType 30, Content and AcknowledgementStatement are required.");
                        }
                        break;

                    case 40:
                        //if (string.IsNullOrWhiteSpace(section.Signature))
                        //{
                         //   throw new Exception("For SectionType 40, Signature is required.");
                        //}
                        break;

                    default:
                        throw new Exception("Invalid SectionTypeId.");
                }
            }
        }
        private void ValidateResponseType(TemplateSectionRequestDto section)
        {
            if (!section.ResponseType.HasValue)
                throw new Exception("ResponseType is required.");

            if (string.IsNullOrWhiteSpace(section.Properties))
                throw new Exception("Properties is required.");

            Dictionary<string, JsonElement>? obj;

            try
            {
                obj = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(section.Properties);
            }
            catch
            {
                throw new Exception("Properties must be a valid JSON string.");
            }

            if (obj == null)
                throw new Exception("Invalid Properties format.");
            switch (section.ResponseType.Value)
            {
                case 10:
                   // if (!obj.ContainsKey("isRequired") || !obj.ContainsKey("maxLength"))
                     //   throw new Exception("ResponseType 10 requires isRequired and maxLength.");
                    break;

                case 20:
                    //if (!obj.ContainsKey("isRequired") ||
                    //    !obj.ContainsKey("min") ||
                    //    !obj.ContainsKey("max"))
                    //    throw new Exception("ResponseType 20 requires isRequired, min and max.");
                    break;

                case 30:
                   // if (!obj.ContainsKey("isRequired") || !obj.ContainsKey("options"))
                    //    throw new Exception("ResponseType 30 requires isRequired and options.");
                    break;

                default:
                    throw new Exception("Invalid ResponseType.");
            }
        }


        #endregion

    }

}

