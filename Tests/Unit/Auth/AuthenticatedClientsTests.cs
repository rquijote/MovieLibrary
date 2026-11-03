using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using Api.Services;
using Application.Enums;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Http;
using Moq;

namespace Tests.Unit.Auth;

public sealed class AuthenticatedClientsTests
{
    private static CurrentTmdbUser User()
    {
        var accessor = new Mock<IHttpContextAccessor>();
        accessor.SetupGet(value => value.HttpContext).Returns(new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, "123"), new Claim(CurrentTmdbUser.SessionClaim, "user-session")], "test"))
        });
        return new(accessor.Object);
    }

    [Fact]
    public async Task GivenCurrentUser_WhenUpdatingFavorites_UsesOnlyThatAccountAndSession()
    {
        // Arrange
        var handler = new CaptureHandler();
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/account/") };
        var client = new AccountClient(http, User());

        // Act
        await client.AddToFavoritesAsync(new AddMediaFavoriteDto { MediaId = 1, Media = MediaType.movie, AddToList = true });

        // Assert
        Assert.Equal("/3/account/123/favorite", handler.Uri?.AbsolutePath);
        Assert.Equal("?session_id=user-session", handler.Uri?.Query);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GivenCurrentUser_WhenReadingPublicDetails_DoesNotAppendAccountStateOrSession(bool movie)
    {
        // Arrange
        var handler = new CaptureHandler();
        using var http = new HttpClient(handler) { BaseAddress = new Uri($"https://api.themoviedb.org/3/{(movie ? "movie" : "tv")}/") };

        // Act
        if (movie)
            await new MovieClient(http, User()).GetMovieById(1);
        else
            await new TvShowClient(http, User()).GetTvShowById(1);

        // Assert
        Assert.DoesNotContain("account_states", handler.Uri!.Query);
        Assert.DoesNotContain("session_id", handler.Uri.Query);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GivenCurrentUser_WhenRating_UsesThatUsersSession(bool movie)
    {
        // Arrange
        var handler = new CaptureHandler();
        using var http = new HttpClient(handler) { BaseAddress = new Uri($"https://api.themoviedb.org/3/{(movie ? "movie" : "tv")}/") };

        // Act
        if (movie)
            await new MovieClient(http, User()).AddRatingMovie(1, 5);
        else
            await new TvShowClient(http, User()).AddRatingTvShow(1, 5);

        // Assert
        Assert.Equal("?session_id=user-session", handler.Uri?.Query);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GivenNoCurrentUser_WhenReadingAccountState_DoesNotCallTmdb(bool movie)
    {
        // Arrange
        var handler = new CaptureHandler();
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };

        // Act / Assert
        if (movie)
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => new MovieClient(http).GetAccountStateMovie(1));
        else
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => new TvShowClient(http).GetAccountStateTvShow(1));
        Assert.Null(handler.Uri);
    }

    private sealed class CaptureHandler : HttpMessageHandler
    {
        public Uri? Uri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Uri = request.RequestUri;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new { id = 1, title = "Test movie", name = "Test show", success = true, status_code = 1 })
            });
        }
    }
}
