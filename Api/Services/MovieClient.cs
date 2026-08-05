using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Api.Services
{
    public sealed class MovieClient(HttpClient http) : IMovieClient
    {
        private readonly HttpClient _http = http;
        public async Task<MovieDto> GetMovieById([FromQuery] int id)
        {
            var response = await _http.GetAsync($"{id}");

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                    throw new KeyNotFoundException(
                        errorResponse?.StatusMessage ?? $"Movie with ID {id} not found.");
                }
            }

            var result = await response.Content.ReadFromJsonAsync<MovieDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize movie response.");
        }
    }
}
