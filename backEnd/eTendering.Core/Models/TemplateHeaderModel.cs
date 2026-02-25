namespace eTendering.Core.Models
{
    public class TemplateHeaderModel
    {
        public Guid Id { get; set; }

        public string? Name { get; set; } 

        public string? Description { get; set; }

        public int TypeId { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedDateTime { get; set; }

        public DateTime? ModifiedDateTime { get; set; }
    }
}
