# Sublizz

## Description

An API to publish sublease offers (CRUD) with complete user authentication (signup, signin, email confirmation, password reset, etc).

## Installation

The application is made with [Nest](https://github.com/nestjs/nest) and uses a **PostgreSQL** database.

1. Rename the `.env.example` file to `.env.dev` and complete the key/value pairs
2. Run `npm run prisma:migrate:dev` to migrate the schema and seed the database.
3. Run `npm install` to install dependencies.
4. Run `npm run start:dev` for a development server.

## E2E Tests

**Docker** and the provided `.env.test` file are required in order to run the tests.

```bash
# PostgreSQL database in a Docker container
docker-compose up -d

# Run database migrations and seeds
npm run prisma:migrate:test && npm run prisma:seed:test

# Run e2e tests
npm run test:e2e
```

![Screenshot](/screenshot_test.png)

## Documentation

API documentation is accessible by navigating to `/api` from your browser (server must be started).

![Screenshot](/screenshot_doc.png)

## License

[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
