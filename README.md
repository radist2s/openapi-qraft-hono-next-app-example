# Hono Qraft stack with Next.js

* Next.js
* OpenAPI Qraft
* Hono
* Zod OpenAPI

## Usage

- Install dependencies
  ```bash
  npm install
  ```
- Generate API client for the Next.js project
  ```bash
  npm run generate-api-client -w @my-project/next
  ```
- Seed the database for the Hono project
  ```bash
  npm run knex:seed:run -w @my-project/api
  ```
- Start the Next.js project
  ```bash
  npm run dev -w @my-project/next
  ```

## Author

Aleksander Batalov <https://github.com/radist2s>

## License

MIT
