import { Metric } from "./metric";
import { AudioFeatures } from "./audiofeatures";

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

    public GetList = (): Metric[] => {
        return [
            this.Danceability,
            this.Energy,
            this.Loudness,
            this.Valence,
            this.Speechiness,
            this.Acousticness,
            this.Instrumentalness,
            this.Liveness,
            this.Tempo
        ]
    };

    private calcAverage = list => list.reduce((prev, curr) => prev + curr) / list.length;

    public Calculate = (audioFeatures: AudioFeatures[]) => {

        this.Populated = true;
        this.Danceability.Value = this.calcAverage(audioFeatures.map(a => a.danceability));
        this.Energy.Value = this.calcAverage(audioFeatures.map(a => a.energy));
        this.Loudness.Value = this.calcAverage(audioFeatures.map(a => a.loudness));
        this.Speechiness.Value = this.calcAverage(audioFeatures.map(a => a.speechiness));
        this.Acousticness.Value = this.calcAverage(audioFeatures.map(a => a.acousticness));
        this.Instrumentalness.Value = this.calcAverage(audioFeatures.map(a => a.instrumentalness));
        this.Liveness.Value = this.calcAverage(audioFeatures.map(a => a.liveness));
        this.Valence.Value = this.calcAverage(audioFeatures.map(a => a.valence));
        this.Tempo.Value = this.calcAverage(audioFeatures.map(a => a.tempo));

        var metrics = this.GetList();

        for (let metric of metrics) {
            let mp = (metric.Value / (metric.Max - metric.Min));
            if (mp < 0)
                mp = 1.0 + mp;
            metric.MarkerPercentage = mp * 100.0;
        }
    }

    constructor() {

        this.Populated = false;

        this.Danceability = <Metric>{
            Title: `Danceability`,
            Content: `Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Energy = <Metric>{
            Title: `Energy`,
            Content: `Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Loudness = <Metric>{
            Title: `Loudness`,
            Content: `The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.`,
            ImageFile: ``,
            Unit: `dB`,
            Min: -49,
            Max: 2,
            NominalMin: -60,
            NominalMax: 0
        };

        this.Valence = <Metric>{
            Title: `Valence`,
            Content: `A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Speechiness = <Metric>{
            Title: `Speechiness`,
            Content: `Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Acousticness = <Metric>{
            Title: `Acousticness`,
            Content: `A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Instrumentalness = <Metric>{
            Title: `Instrumentalness`,
            Content: `Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Liveness = <Metric>{
            Title: `Liveness`,
            Content: `Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.`,
            Unit: ``,
            Min: 0,
            Max: 1,
            NominalMin: 0,
            NominalMax: 1
        };

        this.Tempo = <Metric>{
            Title: `Tempo`,
            Content: `The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.`,
            Unit: `BPM`,
            Min: 0,
            Max: 250,
            NominalMin: 0,
            NominalMax: 250
        };

    };

}
