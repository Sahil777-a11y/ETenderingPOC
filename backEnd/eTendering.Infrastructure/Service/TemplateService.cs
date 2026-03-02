using eTendering.Core.DTOs;
using eTendering.Core.Helpers;
using eTendering.Core.Models;
using eTendering.Infrastructure.Repository.Interface;
using eTendering.Infrastructure.Service.Interface;
using System.Text.Json;
using System.Text.Json.Serialization;

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
                    .Select(template => BuildTemplateDto(template));

                return ResponseFactory.Success<IEnumerable<TemplateDto>>(groupedData, "Templates fetched successfully");
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

                var template = BuildTemplateDto(flatData.GroupBy(x => x.TemplateId).First());

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

                var fullPayload = new
                {
                    customTokens = request.CustomTokens ?? new List<CustomTokenDto>(),
                    sections = request.Sections
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };

                var jsonSections = JsonSerializer.Serialize(fullPayload, jsonOptions);

                var templateId = await _repo.QueryCustomSingleAsync<Guid>(
                    "dbo.sp_InsertTemplateWithSections", 
                    new
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

        /// <summary>
        /// Builds a TemplateDto with custom tokens and nested sections from flat data
        /// </summary>
        private TemplateDto BuildTemplateDto(IGrouping<Guid, TemplateFlatDto> templateGroup)
        {
            var firstRow = templateGroup.First();

            // ✅ Extract unique custom tokens
            var customTokens = templateGroup
                .Where(x => !string.IsNullOrWhiteSpace(x.TokenName))
                .GroupBy(x => x.TokenName)
                .Select(g => new CustomTokenDto
                {
                    Name = g.Key!,
                    Value = g.First().TokenValue
                })
                .ToList();

            // ✅ Extract all sections (flat)
            var allSections = templateGroup
                .Where(s => s.SectionUniqueId != null)
                .GroupBy(s => s.SectionUniqueId)
                .Select(s => new TemplateSectionDto
                {
                    SectionUniqueId = s.Key!.Value,
                    SectionId = s.First().SectionId ?? 0,
                    Title = s.First().Title,
                    Content = s.First().Content,
                    ResponseType = s.First().ResponseType,
                    SectionOrder = s.First().SectionOrder,
                    Properties = s.First().Properties,
                    AcknowledgementStatement = s.First().AcknowledgementStatement,
                    SectionCreatedDateTime = s.First().SectionCreatedDateTime,
                    SectionModifiedDateTime = s.First().SectionModifiedDateTime,
                    ParentTemplateSectionId = s.First().ParentTemplateSectionId,
                    Subsections = new List<TemplateSectionDto>()
                })
                .ToList();

            // ✅ Build nested structure
            var sectionsDictionary = allSections.ToDictionary(s => s.SectionUniqueId);
            var rootSections = new List<TemplateSectionDto>();

            foreach (var section in allSections)
            {
                if (section.ParentTemplateSectionId == null)
                {
                    // Root level section
                    rootSections.Add(section);
                }
                else
                {
                    // Child section - add to parent's Subsections
                    if (sectionsDictionary.TryGetValue(section.ParentTemplateSectionId.Value, out var parentSection))
                    {
                        parentSection.Subsections.Add(section);
                    }
                }
            }

            // ✅ Sort sections and subsections recursively
            SortSectionsRecursively(rootSections);

            return new TemplateDto
            {
                TemplateId = templateGroup.Key,
                TemplateName = firstRow.TemplateName,
                Description = firstRow.Description,
                TypeId = firstRow.TypeId,
                TypeName = firstRow.TypeName,
                IsDeleted = firstRow.IsDeleted,
                TemplateCreatedDateTime = firstRow.TemplateCreatedDateTime,
                TemplateModifiedDateTime = firstRow.TemplateModifiedDateTime,
                CustomTokens = customTokens,
                Sections = rootSections
            };
        }

        /// <summary>
        /// Recursively sorts sections and their subsections by SectionOrder
        /// </summary>
        private void SortSectionsRecursively(List<TemplateSectionDto> sections)
        {
            sections.Sort((a, b) => (a.SectionOrder ?? 0).CompareTo(b.SectionOrder ?? 0));

            foreach (var section in sections)
            {
                if (section.Subsections.Any())
                {
                    SortSectionsRecursively(section.Subsections);
                }
            }
        }

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
                case 20:
                case 30:
                    break;
                default:
                    throw new Exception("Invalid ResponseType.");
            }
        }

        #endregion
    }
}

