FROM gcr.io/google-appengine/aspnetcore:
COPY . /app
WORKDIR /app

ENV BuildingDocker true
CMD ASPNETCORE_URLS=http://*:$PORT dotnet MyReviewProject.dll

FROM node:12-alpine as build-node
WORKDIR ClientApp
COPY ClientApp/package.json .
COPY ClientApp/package-lock.json .
RUN npm install
COPY ClientApp/ .
RUN npm run-script build

FROM build AS publish
RUN dotnet publish "MtReviewProject.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build-node /ClientApp/build ./ClientApp/build