namespace eTendering.Core.DTOs
{
    public class UpsertTenderVendorResponseDto
    {
        public Guid TenderTemplarteHeaderId { get; set; }
        public string? Response { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
