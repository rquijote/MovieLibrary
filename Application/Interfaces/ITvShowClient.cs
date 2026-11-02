using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ITvShowClient
    {
        public Task<TvShowDto> GetTvShowById(int id);
        /// <summary>Retrieves a page of recommendations or similar TV shows.</summary>
        /// <param name="id">The source TV show ID.</param>
        /// <param name="similar">Whether to retrieve similar titles instead of recommendations.</param>
        /// <param name="page">The result page, from 1 to 500.</param>
        /// <returns>The requested page of related TV shows.</returns>
        public Task<TvShowListResponseDto> GetRelatedTvShows(int id, bool similar, int page = 1);
        public Task<TvSeasonDetailsDto> GetSeasonById(int id, int seasonNumber);
        public Task<TvEpisodeDto> GetEpisodeById(int id, int seasonNumber, int episodeNumber);
        public Task<StatusDto> AddRatingTvShow(int id, double rating);
        public Task<StatusDto> DeleteRatingTvShow(int id);
        public Task<AccountStatesDto> GetAccountStateTvShow(int id);
    }
}
