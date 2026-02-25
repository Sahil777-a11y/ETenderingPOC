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

        public async Task<GenericResponseDto<TenderTemplateResponseDto>>GetTenderTemplateByIdAsync(Guid tenderTempHeaderId)
        {
            try
            {
                var flatData = await _repo.QueryCustomListAsync<TenderTemplateFlatDto>(
                    "dbo.sp_GetTenderTemplateById",
                    new { TenderTemplateId = tenderTempHeaderId });

                if (flatData == null || !flatData.Any())
                    return ResponseFactory.Failure<TenderTemplateResponseDto>("Template not found");

                var template = flatData
                    .GroupBy(x => x.TenderTempHeaderId)
                    .Select(group => new TenderTemplateResponseDto
                    {
                        TenderTempHeaderId = group.Key,
                        TenderHeaderId = group.First().TenderHeaderId,
                        Name = group.First().Name,
                        Description = group.First().Description,
                        TypeId = group.First().TypeId,
                        IsDeleted = group.First().IsDeleted,
                        CreatedDateTime = group.First().TemplateCreatedDateTime,
                        ModifiedDateTime = group.First().TemplateModifiedDateTime,

                        Sections = group
                            .Where(s => s.TenderTempSectionId != null)
                            .Select(s => new TenderTemplateSectionResponseDto
                            {
                                TenderTempSectionId = s.TenderTempSectionId.Value,
                                TenderTemplateHeader = s.TenderTemplateHeader.Value,
                                SectionId = s.SectionId ?? 0,
                                Title = s.Title,
                                Content = s.Content,
                                ResponseType = s.ResponseType,
                                Properties = s.Properties,
                                AcknowledgementStatement = s.AcknowledgementStatement,
                                Signature = s.Signature,
                                SectionOrder = s.SectionOrder,
                                CreatedDateTime = s.SectionCreatedDateTime,
                                ModifiedDateTime = s.SectionModifiedDateTime
                            })
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



        public async Task<Guid> UpdateTenderTemplateAsync(UpdateTenderTemplateRequestDto request)
        {
            //ValidateTemplate(request);

            var jsonSections = JsonConvert.SerializeObject(request.Sections);

            return await _repo.QueryCustomSingleAsync<Guid>("dbo.sp_UpdateTenderTemplateWithSections", new
            {
                TenderTemplateId = request.TemplateId,
                request.Name,
                request.Description,
                request.TypeId,
                Sections = jsonSections
            });
        }

        public async Task<(int totalRecords,GenericResponseDto<IEnumerable<TenderListDto>>)> GetTenderListAsync(int pageNumber, int pageSize)
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
                    return (totalRecords,ResponseFactory.Failure<IEnumerable<TenderListDto>>("Tender headers not found"));

                return (totalRecords,ResponseFactory.Success(data, "Tender headers fetched successfully"));
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
                var  data = await _repo.QueryCustomSingleAsync<TenderTempVendorResponseDto>("dbo.sp_GetVendorResponsesByTemplateHeaderId",
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
                await _repo.ExecuteAsync("dbo.sp_InsertTenderTempVendorResponse",new
                    {
                        TenderTemplateHeaderId = tenderTemplateHeaderId,
                        Response = responseJson
                    });

                // 6️⃣ Fetch again
                var insertedData = await _repo.QueryCustomSingleAsync<TenderTempVendorResponseDto>("dbo.sp_GetVendorResponsesByTemplateHeaderId",
                    new { TenderTemplateHeaderId = tenderTemplateHeaderId });

                return ResponseFactory.Success(insertedData,"Vendor Response created and fetched successfully");
            }
            catch (Exception)
            {
                throw;
            }
        }


        public  async Task<GenericResponseDto<Guid>> UpsertVendorResponseAsync(UpsertTenderVendorResponseDto request)
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

        public async Task<GenericResponseDto<bool>>UpdateVendorBidSubmittedDateAsync(Guid tenderId)
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
        /* private void ValidateTemplate(UpdateTenderTemplateRequestDto request)
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
         private void ValidateResponseType(UpdateTenderTemplateRequestDto section)
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
         }*/


        #endregion

    }
}
