namespace eTendering.Core.DTOs
{
    public class TenderDetailsResponseDto
    {
        public Guid TenderId { get; set; }

        public string? Name { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string? TemplateType { get; set; }

        public List<TenderTemplateDetailsDto> Templates { get; set; }
            = new();
    }

    public class TenderTemplateDetailsDto
    {
        public Guid TenderTemplateHeaderId { get; set; }

        public string? Name { get; set; }

        public string? Description { get; set; }

        public bool? IsCompleted { get; set; }

        public DateTime? CompletedDateTime { get; set; }

        public string? Response { get; set; }
    }


}
