# SpotifyApiExplorer

Web app for exploring the Spotify API.

## Running the Container

You will need to provide your Spotify Client ID and Client Secret. Get them from [Spotify's API Dashboard](https://developer.spotify.com/dashboard).

In Azure, provide these values under *Configuration*. Use setting names of `Settings__apikeys__clientid` and `Settings__apikeys__clientsecret` (The double underscores will be intepreted as colons).

You will probably also need to added a `WEBSITES_PORT` setting with a value of 80.
