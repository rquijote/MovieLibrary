using Api.Controllers.Dto.Status;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(IConfiguration config) : ControllerBase
    {
        private readonly string _accountId = config["ACCOUNT_ID"] ?? "";
        private readonly string _bearerToken = config["BEARER_TOKEN"] ?? "";
        private readonly HttpClient _client = new()
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };

        [HttpPost("watchlist")]
        public async Task<IActionResult> AddMediaToWatchlist([FromBody] AddMediaDto addMediaDtoRequest)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"account/{_accountId}/watchlist")
            {
                Content = JsonContent.Create(addMediaDtoRequest)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _bearerToken);

            var response = await _client.SendAsync(request);

            return Ok(new StatusDto { StatusCode = (int)response.StatusCode, Success = response.IsSuccessStatusCode });
        }
    }
}
