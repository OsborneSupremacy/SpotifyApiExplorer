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

# Set password for the certificate as 1234
# I'm using Environment Variable here to simplify the .NET Core sample.
#ENV certPassword 1234
#
## Use opnssl to generate a self signed certificate cert.pfx with password $env:certPassword
#RUN openssl genrsa -des3 -passout pass:${certPassword} -out server.key 2048
#RUN openssl rsa -passin pass:${certPassword} -in server.key -out server.key
#RUN openssl req -sha256 -new -key server.key -out server.csr -subj '/CN=localhost'
#RUN openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
#RUN openssl pkcs12 -export -out cert.pfx -inkey server.key -in server.crt -certfile server.crt -passout pass:${certPassword}


# copy the project file and restore and dependencies
COPY *.csproj ./
RUN dotnet restore

# copy the project files and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish


# generate runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0
WORKDIR /app
# exposes the ports within the container
EXPOSE 443
COPY --from=build-env /app/publish .
ENTRYPOINT ["dotnet", "SpotifyApiExplorer.dll"]


