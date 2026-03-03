using Dapper;
using eTendering.Core.DTOs;
using eTendering.Core.Helpers;
using eTendering.Core.Models;
using eTendering.Infrastructure.Repository.Interface;
using eTendering.Infrastructure.Service.Interface;
using Newtonsoft.Json;
using System.Data;
using System.Data.Common;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace eTendering.Infrastructure.Service
{
    public class TenderService(IGenericRepo<TenderHeaderDto> _repo, IDbConnection _connection) : ITenderService
    {
        public async Task<GenericResponseDto<IEnumerable<TenderHeaderDto>>> GetAllTenderHeadersAsync()
        {
            try
            {
                var data = await _repo.QueryCustomListAsync<TenderHeaderDto>("dbo.sp_GetAllTenderHeaders");

                if (data == null || !data.Any())
                    return ResponseFactory.Failure<IEnumerable<TenderHeaderDto>>("Tender headers not found");

                return ResponseFactory.Success(data, "Tender headers fetched successfully");
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<List<CreatedTenderTemplateDto>>> CreateTenderAsync(CreateTenderRequestModel request)
        {
            try
            {
                var result = (await _repo.QueryCustomListAsync<CreatedTenderTemplateDto>("dbo.sp_CreateTender", new
                {
                    request.Name,
                    request.StartDate,
                    request.EndDate,
                    request.TypeId
                })).ToList();

                if (result == null || !result.Any())
                    return ResponseFactory.Failure<List<CreatedTenderTemplateDto>>("No templates found for this type.");

                return ResponseFactory.Success(result, "Tender created and templates mapped successfully.");
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<bool>> DeleteTenderTempByTenderTempIdAsync(Guid tenderTempId)
        {
            try
            {
                var result = await _repo.QueryCustomSingleAsync<int>("dbo.sp_DeleteTenderTemplateHeader", new { TenderTempId = tenderTempId });

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

        public async Task<GenericResponseDto<TenderTemplateResponseDto>> GetTenderTemplateByIdAsync(Guid tenderTempHeaderId)
        {
            try
            {
                var flatData = await _repo.QueryCustomListAsync<TenderTemplateFlatDto>(
                    "dbo.sp_GetTenderTemplateById",
                    new { TenderTemplateId = tenderTempHeaderId });

                if (flatData == null || !flatData.Any())
                    return ResponseFactory.Failure<TenderTemplateResponseDto>("Template not found");

                var template = BuildTenderTemplateDto(flatData.GroupBy(x => x.TenderTempHeaderId).First());

                return ResponseFactory.Success(template, "Template fetched successfully");
            }
            catch
            {
                throw;
            }
        }

        public async Task<Guid> UpdateTenderTemplateAsync(UpdateTenderTemplateRequestDto request)
        {
            // ✅ Step 1: Assign temp IDs to new sections (so children can reference parents)
            AssignTempIdsToNewSections(request.Sections);

            // ✅ Step 2: Flatten nested structure
            var flatSections = FlattenSections(request.Sections);

            var fullPayload = new
            {
                customTokens = request.CustomTokens ?? new List<CustomTokenDto>(),
                sections = flatSections
            };

            var jsonPayload = JsonConvert.SerializeObject(fullPayload);

            return await _repo.QueryCustomSingleAsync<Guid>("dbo.sp_UpdateTenderTemplateWithSections", new
            {
                TenderTemplateId = request.TemplateId,
                request.Name,
                request.Description,
                request.TypeId,
                Sections = jsonPayload
            });
        }

        /// <summary>
        /// Assigns temporary GUIDs to sections without an ID
        /// </summary>
        private void AssignTempIdsToNewSections(List<UpdateTenderTemplateSectionDto> sections)
        {
            foreach (var section in sections)
            {
                if (section.Id == null || section.Id == Guid.Empty)
                {
                    section.Id = Guid.NewGuid();
                }

                if (section.Subsections != null && section.Subsections.Any())
                {
                    AssignTempIdsToNewSections(section.Subsections);
                }
            }
        }

        /// <summary>
        /// Flattens nested sections into a flat list with ParentTemplateSectionId
        /// </summary>
        private List<object> FlattenSections(List<UpdateTenderTemplateSectionDto> sections, Guid? parentId = null)
        {
            var flatList = new List<object>();

            foreach (var section in sections)
            {
                flatList.Add(new
                {
                    id = section.Id,
                    sectionTypeId = section.SectionTypeId,
                    sectionOrder = section.SectionOrder,
                    title = section.Title,
                    content = section.Content,
                    responseType = section.ResponseType,
                    properties = section.Properties,
                    acknowledgementStatement = section.AcknowledgementStatement,
                    signature = section.Signature,
                    parentTemplateSectionId = parentId  // ✅ Set parent reference
                });

                if (section.Subsections != null && section.Subsections.Any())
                {
                    // ✅ Recursively flatten children with this section's ID as parent
                    flatList.AddRange(FlattenSections(section.Subsections, section.Id));
                }
            }

            return flatList;
        }

        public async Task<(int totalRecords, GenericResponseDto<IEnumerable<TenderListDto>>)> GetTenderListAsync(int pageNumber, int pageSize)
        {
            try
            {
                var (totalRecords, data) = await _repo.QueryCustomListWithCountAsync<TenderListDto>("dbo.sp_GetTenderListWithStatus",
                new
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });

                if (data == null || !data.Any())
                    return (totalRecords, ResponseFactory.Failure<IEnumerable<TenderListDto>>("Tender headers not found"));

                return (totalRecords, ResponseFactory.Success(data, "Tender headers fetched successfully"));
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<GenericResponseDto<TenderDetailsResponseDto>> GetVendersBidByTenderId(Guid tenderId)
        {
            try
            {
                using var multi = await _connection.QueryMultipleAsync("dbo.sp_GetTenderDetailsWithTemplate",
                    new
                    {
                        TenderId = tenderId
                    },
                    commandType: CommandType.StoredProcedure);

                // First result set (Single row)
                var tenderHeader = multi.ReadFirstOrDefault<TenderDetailsResponseDto>();

                if (tenderHeader == null)
                    return ResponseFactory.Failure<TenderDetailsResponseDto>("Tender not found");

                // Second result set (Multiple rows)
                var templates = multi.Read<TenderTemplateDetailsDto>().ToList();

                tenderHeader.Templates = templates;

                return ResponseFactory.Success(tenderHeader, "Tender details fetched successfully");
            }
            catch
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<TenderTempVendorResponseDto>> GetVendorResponseByTenderTemplarteHeaderIdAsync(Guid tenderTemplateHeaderId)
        {
            try
            {
                var data = await _repo.QueryCustomSingleAsync<TenderTempVendorResponseDto>("dbo.sp_GetVendorResponsesByTemplateHeaderId",
                new
                {
                    TenderTemplateHeaderId = tenderTemplateHeaderId
                });

                // 2️⃣ If exists → return
                if (data != null)
                    return ResponseFactory.Success(data, "Vendor Response fetched successfully");

                // 3️⃣ If NOT exists → call template API logic
                var templateResult = await GetTenderTemplateByIdAsync(tenderTemplateHeaderId);

                if (templateResult == null || templateResult.Data == null)
                    return ResponseFactory.Failure<TenderTempVendorResponseDto>("Template not found");

                // 4️⃣ Convert only "data" part into JSON string
                var responseJson = JsonConvert.SerializeObject(templateResult.Data);

                // 5️⃣ Insert into DB
                await _repo.ExecuteAsync("dbo.sp_InsertTenderTempVendorResponse", new
                {
                    TenderTemplateHeaderId = tenderTemplateHeaderId,
                    Response = responseJson
                });

                // 6️⃣ Fetch again
                var insertedData = await _repo.QueryCustomSingleAsync<TenderTempVendorResponseDto>("dbo.sp_GetVendorResponsesByTemplateHeaderId",
                    new { TenderTemplateHeaderId = tenderTemplateHeaderId });

                return ResponseFactory.Success(insertedData, "Vendor Response created and fetched successfully");
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<GenericResponseDto<Guid>> UpsertVendorResponseAsync(UpsertTenderVendorResponseDto request)
        {
            try
            {
                var id = await _repo.QueryCustomSingleAsync<Guid>("dbo.sp_UpsertTenderTempVendorResponse",
                new
                {
                    request.TenderTemplarteHeaderId,
                    request.Response,
                    request.IsCompleted
                });
                return ResponseFactory.Success(id, "Vendor response saved successfully");
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<GenericResponseDto<bool>> UpdateVendorBidSubmittedDateAsync(Guid tenderId)
        {
            try
            {
                var rowsAffected = await _repo.QueryCustomSingleAsync<int>("dbo.sp_UpdateVendorBidSubmittedDate", new
                {
                    TenderId = tenderId
                });

                if (rowsAffected == 0)
                    return ResponseFactory.Failure<bool>("No vendor bid found for this tender.");

                return ResponseFactory.Success(true, "Submitted date updated successfully.");
            }
            catch (Exception)
            {
                throw;
            }
        }


        #region Private Functions

        /// <summary>
        /// Builds a TenderTemplateResponseDto with custom tokens and nested sections from flat data
        /// </summary>
        private TenderTemplateResponseDto BuildTenderTemplateDto(IGrouping<Guid, TenderTemplateFlatDto> templateGroup)
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

            // ✅ Extract all sections (flat, deduplicated by TenderTempSectionId)
            var allSections = templateGroup
                .Where(s => s.TenderTempSectionId != null)
                .GroupBy(s => s.TenderTempSectionId)
                .Select(s => new TenderTemplateSectionResponseDto
                {
                    TenderTempSectionId = s.Key!.Value,
                    TenderTemplateHeader = s.First().TenderTemplateHeader ?? Guid.Empty,
                    SectionId = s.First().SectionId ?? 0,
                    Title = s.First().Title,
                    Content = s.First().Content,
                    ResponseType = s.First().ResponseType,
                    Properties = s.First().Properties,
                    AcknowledgementStatement = s.First().AcknowledgementStatement,
                    Signature = s.First().Signature,
                    SectionOrder = s.First().SectionOrder,
                    CreatedDateTime = s.First().SectionCreatedDateTime,
                    ModifiedDateTime = s.First().SectionModifiedDateTime,
                    ParentTemplateSectionId = s.First().ParentTemplateSectionId,
                    Subsections = new List<TenderTemplateSectionResponseDto>()
                })
                .ToList();

            // ✅ Build nested structure
            var sectionsDictionary = allSections.ToDictionary(s => s.TenderTempSectionId);
            var rootSections = new List<TenderTemplateSectionResponseDto>();

            foreach (var section in allSections)
            {
                if (section.ParentTemplateSectionId == null)
                {
                    rootSections.Add(section);
                }
                else
                {
                    if (sectionsDictionary.TryGetValue(section.ParentTemplateSectionId.Value, out var parentSection))
                    {
                        parentSection.Subsections.Add(section);
                    }
                }
            }

            // ✅ Sort sections and subsections recursively
            SortTenderSectionsRecursively(rootSections);

            return new TenderTemplateResponseDto
            {
                TenderTempHeaderId = templateGroup.Key,
                TenderHeaderId = firstRow.TenderHeaderId,
                Name = firstRow.Name,
                Description = firstRow.Description,
                TypeId = firstRow.TypeId,
                IsDeleted = firstRow.IsDeleted,
                CreatedDateTime = firstRow.TemplateCreatedDateTime,
                ModifiedDateTime = firstRow.TemplateModifiedDateTime,
                CustomTokens = customTokens,
                Sections = rootSections
            };
        }

        /// <summary>
        /// Recursively sorts tender template sections and their subsections by SectionOrder
        /// </summary>
        private void SortTenderSectionsRecursively(List<TenderTemplateSectionResponseDto> sections)
        {
            sections.Sort((a, b) => a.SectionOrder.CompareTo(b.SectionOrder));

            foreach (var section in sections)
            {
                if (section.Subsections.Any())
                {
                    SortTenderSectionsRecursively(section.Subsections);
                }
            }
        }

        #endregion

    }
}
