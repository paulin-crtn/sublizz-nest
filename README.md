# Sublizz

## Description

An API to publish sublease offers (CRUD) with complete user authentication (signup, signin, email confirmation, password reset, etc).

## Installation

The application is made with [Nest](https://github.com/nestjs/nest) and uses a **PostgreSQL** database.

1. Rename the `.env.example` file to `.env` and complete the key/value pairs
2. Run `npm install` to install dependencies.
3. Run `npm run start:dev` for development or `npm run start:prod` for production.

## E2E Tests

**Docker** and the provided `.env.test` file are required in order to run the tests.

```bash
# PostgreSQL database in a Docker container
$ docker-compose up -d

# Run database migration
npm run prisma:migrate:test

# Run e2e tests
npm run test:e2e
```

![Screenshot](/screenshot_test.png)

## Documentation

API documentation is being written.

## License

[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
