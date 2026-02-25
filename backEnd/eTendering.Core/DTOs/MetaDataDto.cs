namespace eTendering.Core.DTOs
{
    public class MetaDataDto
    {
        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int SortBy { get; set; }

        // To ensure clean logging in plaintext logs, override ".ToString()" method.

        public object? ValidationErrors { get; set; }
        public bool HasValidationErrors { get; set; }
        public List<string>? ValidationMessages { get; set; }

        public override string ToString()
        {
            return $"PageNumber={PageNumber}, PageSize={PageSize}, SortBy={SortBy}";
        }
    }
}
