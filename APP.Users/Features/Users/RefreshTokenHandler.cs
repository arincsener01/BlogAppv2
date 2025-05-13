using APP.Users.Domain;
using CORE.APP.Features;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace APP.Users.Features.Users
{
    public class RefreshTokenRequest : Request, IRequest<RefreshTokenResponse>
    {
        [JsonIgnore]
        public override int Id { get => base.Id; set => base.Id = value; }

        [Required]
        public string Token { get; set; }

        [Required]
        public string RefreshToken { get; set; }
    }

    public class RefreshTokenResponse : TokenResponse
    {
        public RefreshTokenResponse(bool isSuccessful, string message = "", int id = 0) : base(isSuccessful, message, id)
        {
        }
    }

    public class RefreshTokenHandler : UsersDbHandler, IRequestHandler<RefreshTokenRequest, RefreshTokenResponse>
    {
        public RefreshTokenHandler(UsersDb db) : base(db)
        {
        }

        public async Task<RefreshTokenResponse> Handle(RefreshTokenRequest request, CancellationToken cancellationToken)
        {
            var principal = GetPrincipal(request.Token);
            var userId = Convert.ToInt32(principal.Claims.SingleOrDefault(c => c.Type == "Id").Value);
            var user = await _db.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Id == userId && u.RefreshToken == request.RefreshToken && u.RefreshTokenExpiration >= DateTime.Now, cancellationToken);
            if (user is null)
                return new RefreshTokenResponse(false, "User not found!");
            var claims = GetClaims(user);
            var expiration = DateTime.Now.AddMinutes(AppSettings.ExpirationInMinutes);
            var accessToken = CreateAccessToken(claims, expiration);

            // refresh token:
            user.RefreshToken = CreateRefreshToken();
            // for sliding expiration:
            //user.RefreshTokenExpiration = DateTime.Now.AddDays(AppSettings.RefreshTokenExpirationInDays);
            _db.Users.Update(user);
            await _db.SaveChangesAsync(cancellationToken);

            return new RefreshTokenResponse(true, "Token created successfully.", user.Id)
            {
                Token = $"{JwtBearerDefaults.AuthenticationScheme} {accessToken}",
                RefreshToken = user.RefreshToken
            };
        }
    }
}