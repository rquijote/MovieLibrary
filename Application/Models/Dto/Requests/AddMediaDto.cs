using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Models.Dto.Requests
{
    public sealed record AddMediaDto
    {
        public MediaType Media { get; init; }
        public int MediaId { get; init; }
        public bool AddToList { get; init; }
    }

    public enum MediaType
    {
        tv,
        movie
    }
}
