using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Interface
{
    public interface IDateTimeProvider
    {
        DateTime GetCurrentDateTime();
    }
}
