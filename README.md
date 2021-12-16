
# Fullstack Boilerplate

A Fullstack react graphql boilerplate in NX with PWA and end to end typescript support

(demo graphql apis available for authentication using jwt, following users, creating posts, creating conversations etc)


## Tech used

- nx
- graphql
- nexus
- prisma
- react
- material-ui
- redux
- hooks
- typescript-end-to-end


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`


## Run Locally

Clone the project

```bash
  git clone https://github.com/facinick/fullstack-template.git
```

Go to the project directory

```bash
  cd fullstack-template
```

Install dependencies

```bash
  yarn
```

Run postgres instance locally or remotely, put the connection string in .env file

Delete `/Users/shriyanskapoor/Github/fulstack-boilerplate/libs/prisma-client/prisma/migrations` folder

Run prisma migrations
```bash
  yarn prisma:migrate
```

Start api

```bash
  npx nx api
```

Start frontend

```bash
  npx nx web-app
```

Or start both (and watch automatically for any change end to end)

```bash
  yarn start:all
```

build both

```bash
  yarn build:all
```

start prisma studio

```bash
  yarn prisma:studio
```