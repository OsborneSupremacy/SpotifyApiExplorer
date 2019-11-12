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

        [JsonProperty("requestSettings")]
        public RequestSettings RequestSettings { get; set; }

        [JsonProperty("metricSettings")]
        public MetricSettings MetricSettings { get; set; }
    }

    [JsonObject("apikeys")]
    public class ApiKeys
    {
        [JsonProperty("clientid")]
        public string ClientId { get; set; }

        [JsonProperty("clientsecret")]
        public string ClientSecret { get; set; }
    }

    [JsonObject("requestSettings")]
    public class RequestSettings
    {
        [JsonProperty("maxAttempts")]
        public int MaxAttempts { get; set; }
    }

    [JsonObject("metricSettings")]
    public class MetricSettings
    {
        [JsonProperty("topArtistsToShow")]
        public int TopArtistsToShow { get; set; }

        [JsonProperty("TopGenresToShow")]
        public int TopGenresToShow { get; set; }
    }

}
