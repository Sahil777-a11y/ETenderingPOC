namespace eTendering.Core.DTOs
{
    public class InsertTemplateRequestDto
    {
        public Guid? TemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        
        /// <summary>
        /// Custom tokens for template placeholders
        /// </summary>
        public List<CustomTokenDto>? CustomTokens { get; set; }
        
        public List<TemplateSectionRequestDto> Sections { get; set; } = new();
    }

    public class TemplateSectionRequestDto
    {
        public Guid? Id { get; set; }  
        public int SectionTypeId { get; set; }
        public int SectionOrder { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? ResponseType { get; set; }
        public string? Properties { get; set; }
        public string? AcknowledgementStatement { get; set; }
        public string? Signature { get; set; }
        public List<TemplateSectionRequestDto>? Subsections { get; set; }
    }

    /// <summary>
    /// Custom token DTO
    /// </summary>
    public class CustomTokenDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Value { get; set; }
    }
}
