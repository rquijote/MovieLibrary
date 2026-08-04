using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Api.Services
{
    public sealed class MovieDetailsClient(HttpClient http) : IMovieDetailsClient
    {
        private readonly HttpClient _http = http;

        public async Task<object> GetMovieByIdAsync(int id)
        {
            var response = await _http.GetAsync($"{id}");
            var body = await response.Content.ReadAsStringAsync();

            var node = JsonNode.Parse(body);
            if (node?["success"] is JsonNode successNode && !(bool)successNode)
            {
                return JsonSerializer.Deserialize<StatusDto>(body)!;
            }

            var movieDto = JsonSerializer.Deserialize<MovieDto>(body);
            return new MovieSummaryDto
            {
                Id = movieDto!.Id,
                Title = movieDto.Title
            };
        }
    }
}
