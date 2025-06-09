
## For running locally on Docker 

Run to just build a docker image:
```sh
make build
```

But running will both build and start a container:
```sh
docker compose up -d
```

### To build a Docker with hot reload

```sh
make build-dev
```

## For local development without Docker

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

The server will be listening on http://localhost:3000