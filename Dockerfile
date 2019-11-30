FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS build
WORKDIR /app

# Prevent 'Warning: apt-key output should not be parsed (stdout is not a terminal)'
ENV ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# install NodeJS 13.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install build-essential -yq

WORKDIR /src
COPY ["SpotifyApiExplorer.csproj", ""]
RUN dotnet restore "./SpotifyApiExplorer.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "SpotifyApiExplorer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotifyApiExplorer.csproj" -c Release -o /app/publish

FROM publish AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotifyApiExplorer.dll"]


