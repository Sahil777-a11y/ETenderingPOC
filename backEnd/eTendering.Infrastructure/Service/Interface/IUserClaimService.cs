using System.Security.Claims;

namespace eTendering.Infrastructure.Service.Interface
{
    public interface IUserClaimService
    {
        string? GetObjectId(ClaimsPrincipal user);
    }
}
