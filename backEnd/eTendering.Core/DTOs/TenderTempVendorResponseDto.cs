namespace eTendering.Core.DTOs
{
    public class TenderTempVendorResponseDto
    {
        public Guid ResposneId { get; set; }

        public Guid VendorBidId { get; set; }

        public Guid TenderTemplateHeaderId { get; set; }

        public string? Response { get; set; }

        public bool? IsCompleted { get; set; }

        public DateTime? CompletedDateTime { get; set; }
    }
}
