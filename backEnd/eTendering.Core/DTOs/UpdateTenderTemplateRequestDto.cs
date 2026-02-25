namespace eTendering.Core.DTOs
{
    public class UpdateTenderTemplateRequestDto
    {
        public Guid TemplateId { get; set; }  // Not nullable
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public List<UpdateTenderTemplateSectionDto> Sections { get; set; } = new();
    }

    public class UpdateTenderTemplateSectionDto
    {
        public Guid? Id { get; set; }  // Not nullable
        public int SectionTypeId { get; set; }
        public int SectionOrder { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public string? Signature { get; set; }
    }
}
