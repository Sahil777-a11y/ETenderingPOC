namespace eTendering.Core.DTOs
{
    public class TemplateDto
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public DateTime TemplateCreatedDateTime { get; set; }
        public DateTime? TemplateModifiedDateTime { get; set; }

        public List<TemplateSectionDto> Sections { get; set; } = new();
    }
    public class TemplateSectionDto
    {
        public Guid SectionUniqueId { get; set; }
        public int SectionId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public int? SectionOrder { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public DateTime? SectionCreatedDateTime { get; set; }
        public DateTime? SectionModifiedDateTime { get; set; }
    }

    public class TemplateFlatDto
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public DateTime TemplateCreatedDateTime { get; set; }
        public DateTime? TemplateModifiedDateTime { get; set; }

        public Guid? SectionUniqueId { get; set; }
        public int? SectionId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public int? SectionOrder { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public DateTime? SectionCreatedDateTime { get; set; }
        public DateTime? SectionModifiedDateTime { get; set; }
    }


}
