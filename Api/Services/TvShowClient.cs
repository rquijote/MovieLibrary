using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public class TvShowClient(HttpClient http) : ITvShowClient
    {
        private readonly HttpClient _http = http;

        public async Task<TvShowDto> GetTvShowById(int id)
        {
            var response = await _http.GetAsync($"{id}");
            
            if (!response.IsSuccessStatusCode)
            {
                
            }

            return new TvShowDto { Name = "" };
        }
    }
}
