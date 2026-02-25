namespace eTendering.Core.DTOs
{
    public class TenderListDto
    {
        public Guid TenderId { get; set; }

        public string? Name { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string? TemplateType { get; set; }

        public string? Status { get; set; }
    }
}
