namespace eTendering.Core.DTOs
{
    public class TenderHeaderDto
    {
        public Guid TenderHeaderId { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int TypeId { get; set; }

        public string TypeName { get; set; } = string.Empty;

        public DateTime CreatedDateTime { get; set; }

        public DateTime? ModifiedDateTime { get; set; }
    }
}
