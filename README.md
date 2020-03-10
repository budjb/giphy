# HEGiphy

Search the Giphy image database, and save and categorize your favorite images!

# Running

Use the following steps to run the HEGiphy service.

## Prerequisites

To run the applications contained in this service, the following prerequisites are required.

### MongoDB

A MongoDB instance is used to store user data - specifically records of what Giphy images
are a user's favorites. An easy way to get started is to simply install and run a MongoDB
instance locally, and connect to the database over `localhost` with default login
`credentials`.

The details of how to install and configure a MongoDB instance are left to the user, but
the URI and credentials will need to be used to run the `hegiphy-api` project.

### Auth0

This service uses Auth0 as the authentication provider backend. An account must be created
along with an Application and an API.

When signing up, a new tenant will be created. The name of the tenant will also be used
as the Oauth2 issuer endpoint, and will be needed to configure the HEGiphy API application.

As an example, if the tenant that was created was named `budjb-hegiphy`, the issuer URL
will likely be `https://budb-hegiphy.auth0.com/`. The trailing slash is important.

#### Connections

The Connections determine what type of logins will be available to end users. Local sign-ups
are possible using the `Database` connection type. Social sign-ign options (such as Google,
Facebook, etc) are also available. The connections to use are not important to the functionality
of the HEGiphy service, and may be chosen at your discretion. At least one connection must be
configured.

Please note that by default, social connections use Auth0's connection credentials. For proper
functionality of the application, any social connections that are configured should use your own
connection credentials. For example, if Google login will be used, you will need to configure
an application in the Google developer site and use the generated credentials in the Auth0
connection configuration.

#### Auth0 Application Configuration

In the Auth0 dashboard, create a new Application. The following settings must be used:

* The type of the application must be `Single Page Application`.
* The name may be anything of your choosing.
* The `Allowed Callback URLs`, `Allowed Logout URLs`, and `Allowed Web Origins` settings
  must be set to whatever URL that will be used to access the HEGiphy UI (if running locally,
  this is likely `https://localhost:3000`).

All other settings may be left with their default values. The `Client ID` that is generated for
the Application will be used by the HEGiphy UI application.

Once the Application is created, use the Connections tab to select any previously configured
Connections with the Application.

#### Auth0 API Configuration

In the Auth0 dashboard, create a new API. The following settings must be used:

* The name may be anything of your choosing.
* Choose an arbitrary `Identifier`. This may not be changed after the API is created.
  This string will be used as the JWT audience token. Note that this string will be needed
  to configure the HEGiphy API application.
  
All other settings may be left with their default values.

### Giphy

A developer account with Giphy is required in order to use their API service. An account
may be created at `https://developers.giphy.com/`. Be sure to create an app and take note
of the Giphy API key, which will be needed to configure the HEGiphy API application.

## Running the API application

### Configure

To configure the HEGiphy API application, edit the `hegipiy-api/src/main/resources/application.properties`
file. You will need to plug in the values you obtained from the Auth0 setup. Replace the values in the
following template surrounded by `<` and `>`.

```properties
auth0.audience=<Auth0 API audience>
spring.security.oauth2.resourceserver.jwt.issuer-uri=<Auth0 issuer, (https://tenant.auth0.com)>
giphy.base-uri=https://api.giphy.com/v1
spring.data.mongodb.uri=mongodb://<host>/<db>
giphy.api-key=<Giphy API key>

```

### Starting

To start the application, start a shell and navigate to the `hegipy-api` directory. Then, run:

```properties
./gradlew bootRun
```

The application should start without errors and you should see log lines stating:

> Tomcat started on port(s): 8080 (http) with context path ''
> Started Application in 2.442 seconds (JVM running for 8.124)

## Running the UI Application

Note that you will need to have NodeJS v12.14 or a version compatible with it, along with
yarn installed.

### Configure

To configure the HEGiphy UI application, edit the file `hegiphy-ui/src/config.json`.
You will need to plug in the values you obtained from the Auth0 setup. Replace the values in the
following template surrounded by `<` and `>`.

```json
{
  "domain": "<Auth0 issuer (tenant.auth0.com)>",
  "clientId": "<Auth0 Application Client ID>",
  "audience": "<Auth0 API Audience>",
  "hegiphyApiBaseUri": "http://localhost:8080"
}
```

### Starting

To start the application, start a shell and navigate to the `hegipy-ui` directory. Then, run:

```shell script
yarn install
yarn start
```

# Using HEGiphy

Using a web browser, navigate to `http://localhost:3000`. Your browser will be redirected to
an authentication screen. If Auth0 was configured with a social login connection, you may use
one of those to log in. If Auth0 was configured with a database connection, you may create a new
account to log in.

Once you have successfully logged in, your browser will be redirected to a page containing the
top 9 trending Giphy images.

## Favorites

Each displayed Giphy image has a heart icon underneath the image. To mark an image as one of your
favorites, click the heart icon. The icon will change from an outline to solid. To remove
the image from your favorites, simply click the solid heart icon, which will make the icon revert
to an outlined heart image.

To view only your favorite images, click the Favorites link at the top of the page. Nine images
per page will be shown, and you may navigate through pages using the links at the bottom of the
page (if there is more than one page).

If you have categorized any images using tags, those tag names will appear at the top of the page.
Click any of these tags to limit your view to only those images who have that matching tag. Clicking
the active tag will revert the page back to an unfiltered view of favorite images.

Once an image has been marked as a favorite, a new icon that looks like a price tag will appear next
to the heart icon. This may be used to categorize the image using tags. When the price tag icon is
clicked, a popup will appear that shows all of the current tags assigned to the image, with a link
to add additional tags. Tag names may be whatever you like, and any images that share a specific tag
may be considered part of the same "category". Tags may also be removed from within the popup by
hovering over the tag and clicking the X icon that appears.

## Searching

The top of the page contains a search bar. You may enter some words or description of images to
search for, and the search results page will appear. There will likely be many results, and the
page will display only 9 at a time with the ability to navigate to other pages. The ability to
mark images as favorites and add tags also applies on the search results page.
