using eTendering.Infrastructure.Service.Interface;
using System.Security.Claims;

namespace eTendering.Infrastructure.Service
{
    public class UserClaimService : IUserClaimService
    {
        public string? GetObjectId(ClaimsPrincipal user)
        {
            return user?.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

        }
    }
}
