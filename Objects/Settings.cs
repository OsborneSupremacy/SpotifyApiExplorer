using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpotifyApiExplorer.Objects
{
    [JsonObject("Settings")]
    public class Settings
    {
        [JsonProperty("apikeys")]
        public ApiKeys ApiKeys { get; set; }
    }

    [JsonObject("apikeys")]
    public class ApiKeys
    {
        [JsonProperty("clientid")]
        public string ClientId { get; set; }

        [JsonProperty("clientsecret")]
        public string ClientSecret { get; set; }
    }


}
