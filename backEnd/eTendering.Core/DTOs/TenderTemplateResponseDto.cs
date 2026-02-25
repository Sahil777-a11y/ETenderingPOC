namespace eTendering.Core.DTOs
{
    public class TenderTemplateResponseDto
    {
        public Guid TenderTempHeaderId { get; set; }
        public Guid TenderHeaderId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime? ModifiedDateTime { get; set; }

        public List<TenderTemplateSectionResponseDto> Sections { get; set; } = new();
    }
    public class TenderTemplateSectionResponseDto
    {
        public Guid TenderTempSectionId { get; set; }
        public Guid TenderTemplateHeader { get; set; }
        public int SectionId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public string? Signature { get; set; }
        public int SectionOrder { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
    }


    public class TenderTemplateFlatDto
    {
        public Guid TenderTempHeaderId { get; set; }
        public Guid TenderHeaderId { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public bool IsDeleted { get; set; }

        public DateTime TemplateCreatedDateTime { get; set; }
        public DateTime? TemplateModifiedDateTime { get; set; }

        // Section
        public Guid? TenderTempSectionId { get; set; }
        public Guid? TenderTemplateHeader { get; set; }   // optional
        public int? SectionId { get; set; }

        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public string? Signature { get; set; }
        public int SectionOrder { get; set; }

        public DateTime SectionCreatedDateTime { get; set; }
        public DateTime? SectionModifiedDateTime { get; set; }
    }


}
