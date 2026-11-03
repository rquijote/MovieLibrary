using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MySqlConnector;

namespace Api.Services;

public sealed class LocalListsFilter(IConfiguration configuration) : IAsyncResourceFilter, IExceptionFilter
{
    public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
    {
        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (string.IsNullOrWhiteSpace(configuration.GetConnectionString("MovieLibrary")))
        {
            context.Result = Error(503, "Local list storage is not configured.");
            return;
        }

        await next();
    }

    public void OnException(ExceptionContext context)
    {
        var result = context.Exception switch
        {
            KeyNotFoundException => Error(404, "List or movie not found."),
            ArgumentException => Error(400, "Invalid list input. Names must be 1-200 characters, descriptions at most 2000, and IDs positive."),
            MySqlException => Error(503, "Local list storage is unavailable. Check database setup."),
            HttpRequestException => Error(502, "Movie details could not be retrieved from TMDB."),
            _ => null
        };
        if (result is not null)
        {
            context.ExceptionHandled = true;
            context.Result = result;
        }
    }

    private static ObjectResult Error(int status, string title) => new(new ProblemDetails
    {
        Status = status, Title = title
    }) { StatusCode = status };
}