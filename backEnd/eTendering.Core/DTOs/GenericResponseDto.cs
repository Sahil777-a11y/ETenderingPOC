namespace eTendering.Core.DTOs
{
    public class GenericResponseDto<T>
    {
        public long Id { get; set; }

        public bool Success { get; set; }

        public string? Message { get; set; }

        public T? Data { get; set; }

        public string? AlertType { get; set; }

        public MetaDataDto? MetaData { get; set; } = new();
    }
}
