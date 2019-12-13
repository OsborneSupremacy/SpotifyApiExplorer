# Get base SDK
FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS build-env
WORKDIR /app

# Prevent 'Warning: apt-key output should not be parsed (stdout is not a terminal)
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# install NodeJS 13.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install build-essential -yq

# copy the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# copy the project files and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# generate runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0
WORKDIR /app
# expose the ports within the container
EXPOSE 443
COPY --from=build-env /app/publish .
ENTRYPOINT ["dotnet", "SpotifyApiExplorer.dll"]


