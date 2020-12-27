using System;
using SpotifyApiExplorer.Interface;

namespace SpotifyApiExplorer.Services
{
    public class DateTimeProvider : IDateTimeProvider
    {
        public DateTime GetCurrentDateTime() => DateTime.Now;
    }
}
