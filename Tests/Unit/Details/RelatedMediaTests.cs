using System.Net;
using System.Net.Http.Json;
using Api.Services;

namespace Tests.Unit.Details;

/// <summary>Verifies paginated related-title requests against the HTTP client boundary.</summary>
public class RelatedMediaTests
{
    [Theory]
    [InlineData(false, false)]
    [InlineData(false, true)]
    [InlineData(true, false)]
    [InlineData(true, true)]
    public async Task GivenRelatedFeed_WhenRequestingSecondPage_ReturnsPaginationAndCorrectRoute(bool tv, bool similar)
    {
        using var handler = new RelatedMediaHandler(HttpStatusCode.OK);
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://example.test/") };

        if (tv)
        {
            var result = await new TvShowClient(http).GetRelatedTvShows(1399, similar, 2);
            Assert.Equal(2, result.Page);
            Assert.Equal(3, result.TotalPages);
            Assert.Equal(41, result.TotalResults);
            Assert.Equal(42, Assert.Single(result.Results).Id);
        }
        else
        {
            var result = await new MovieClient(http).GetRelatedMovies(1399, similar, 2);
            Assert.Equal(2, result.Page);
            Assert.Equal(3, result.TotalPages);
            Assert.Equal(41, result.TotalResults);
            Assert.Equal(42, Assert.Single(result.Results).Id);
        }

        Assert.Equal($"https://example.test/1399/{(similar ? "similar" : "recommendations")}?page=2", handler.RequestUri);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task GivenMissingTitle_WhenLoadingRelatedTitles_ThrowsNotFound(bool tv)
    {
        using var handler = new RelatedMediaHandler(HttpStatusCode.NotFound);
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://example.test/") };

        await Assert.ThrowsAsync<KeyNotFoundException>(async () =>
        {
            if (tv) await new TvShowClient(http).GetRelatedTvShows(1399, false);
            else await new MovieClient(http).GetRelatedMovies(1399, false);
        });
    }

    [Theory]
    [InlineData(false, 0)]
    [InlineData(false, 501)]
    [InlineData(true, 0)]
    [InlineData(true, 501)]
    public async Task GivenInvalidPage_WhenLoadingRelatedTitles_RejectsBeforeRequest(bool tv, int page)
    {
        using var handler = new RelatedMediaHandler(HttpStatusCode.OK);
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://example.test/") };

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(async () =>
        {
            if (tv) await new TvShowClient(http).GetRelatedTvShows(1399, true, page);
            else await new MovieClient(http).GetRelatedMovies(1399, true, page);
        });
        Assert.Null(handler.RequestUri);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task GivenUpstreamFailure_WhenLoadingRelatedTitles_ThrowsHttpError(bool tv)
    {
        using var handler = new RelatedMediaHandler(HttpStatusCode.ServiceUnavailable);
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://example.test/") };

        await Assert.ThrowsAsync<HttpRequestException>(async () =>
        {
            if (tv) await new TvShowClient(http).GetRelatedTvShows(1399, false);
            else await new MovieClient(http).GetRelatedMovies(1399, false);
        });
    }

    private sealed class RelatedMediaHandler(HttpStatusCode status) : HttpMessageHandler
    {
        public string? RequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri?.AbsoluteUri;
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = status == HttpStatusCode.OK
                    ? JsonContent.Create(new
                    {
                        page = 2,
                        total_pages = 3,
                        total_results = 41,
                        results = new[] { new { id = 42, title = "Related movie", name = "Related show" } }
                    })
                    : JsonContent.Create(new { success = false, status_code = 34, status_message = "Title not found." })
            });
        }
    }
}
