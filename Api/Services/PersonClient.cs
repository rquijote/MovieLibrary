using System.Net;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class PersonClient(HttpClient http) : IPersonClient
    {
        private readonly HttpClient _http = http;

        public async Task<PersonDetailsDto> GetPersonById(int id)
        {
            var response = await _http.GetAsync($"{id}?append_to_response=combined_credits,images,external_ids");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(
                    errorResponse?.StatusMessage ?? $"Person with ID {id} not found.");
            }

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PersonDetailsDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize person response.");
        }
    }
}
