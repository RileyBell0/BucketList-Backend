# Bucket List Backend Server

## Summarised file structure

This is a summarised version, not all files are shown below.

```
├── .github
│   └── workflows
│       ├── npm_test_workflow.yaml
│       └── prettier_workflow.yaml
├── api
├── auth
├── imgur
├── routers
├── schema
├── util
├── .env
├── app.js
├── db.js
├── package.json
└── server.js
```

- **api**: api functionality called by routers upon incoming request
- **auth**: authentication middleware and passport config
- **imgur**: image handling functionality via imgur api
- **routers**: files that call corresponding api functionality on incoming request
- **schema**: database and validation schemas
- **util**: utilities for http responses
- **.env**: environment variables
  - **_(Not including in repo, must be configured manually)_**
- **app.js**: server configuration
- **db.js**: configuration for database connection
- **package.json**: node app information, dependencies and scripts
- **server.js**: entry point, listens and responds to requests

## Getting started

### Required dependencies:

- node: https://nodejs.org/en/
- node package manager: https://www.npmjs.com/

### Installing other dependencies:

- The other dependencies are defined in `package.json` and `package-lock.json`
- To install them run `npm install` in terminal

### Configuring environment variables:

- Create .env file at root of folder
- Put the following in the .env file (replacing information between the <> with your relevant information):

```
# mongo
MONGO_URL=<mongoConnectionString>
MONGO_DB=<mongoDbName>

# express
EXPRESS_SECRET=<expressSecret>

# urls
FRONTEND_URL=<frontendUrl>
BACKEND_URL=<backendUrl>

# cookie flags
ALL_ORIGINS="FALSE"
SAME_HOST_COOKIE="TRUE"

# imgur
IMGUR_CLIENT_ID=<imgurClientID>

# mail
SMTP_SERVICE=<smtpService>
SMTP_USER=<smtpEmail>
SMTP_PASS=<smtpPassword>
```

- Where:
  - **mongoConnectionString/mongoDbName**: can be obtained after setting up a mongodb database https://www.mongodb.com/
  - **expressSecret**: is used for session security
  - **frontendUrl**: is the url where the frontend is served _(note that frontend and backend urls should be using the subdomains used by the reverse proxy see below)_
  - **backendUrl**: is the url where the backend is located
  - **imgurClientID**: is the id to use imgur api: https://apidocs.imgur.com/
  - **smtpService**: is the name of the SMTP provider
  - **smtpEmail**: is the email address of the account used for sending forgot account responses
  - **smtpPassword**: is the password to the corresponding email address

Alternatively, configure this through your host/deployment provider

### Configuring reverse proxy

A reverse proxy is required for Bucket List to operate properly.

We recommend using a Cloudflare domain (https://www.cloudflare.com/) as the reverse proxy, as that's what was used during development.

DNS routing should be used to route requests to one subdomain to the frontend, and requests to another subdomain to the backend. This ensures that cookies used for authentication are not classed as cross origin and thus are set properly on iOS devices.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs server.js to start the server

### `npx prettier --write .`

Runs prettier code formatting on all files that aren't being ignored.
