namespace Api.Options
{
    public sealed class TmdbOptions
    {
        public string BaseUrl { get; set; } = "";
        public string AccountId { get; set; } = "";
        public string BearerToken { get; set; } = $"https://api.themoviedb.org/3/account/";
    }
}
