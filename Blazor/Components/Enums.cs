namespace Blazor.Components
{
    public class Enums
    {
        public enum MediaType
        {
            Movies,
            Tv
        }

        public enum Category
        {
            // General categories
            Popular,
            TopRated,
            Trending,

            // User-specific
            Watchlist,
            Favorite,

            // Movie-specific
            NowPlaying,
            Upcoming,

            // TV-specific
            AiringToday,
            OnTheAir
        }
    }
}
