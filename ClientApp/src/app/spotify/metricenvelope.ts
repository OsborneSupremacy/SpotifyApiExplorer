import { Metric } from "./metric";

export class MetricEnvelope {
    Populated: boolean;
    Danceability: Metric;
    Energy: Metric;
    Loudness: Metric;
    Valence: Metric;
    Speechiness: Metric;
    Acousticness: Metric;
    Instrumentalness: Metric;
    Liveness: Metric;
    Tempo: Metric;
}
