# API

This is a Node.js API built with Elysia.js, a fast, and intuitive web framework for Bun.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Bun](httpshttps://bun.sh/)
- [Node.js](https://nodejs.org/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/deepankarsandy/api.git
   ```
2. Install NPM packages
   ```sh
   bun install
   ```

## Usage

To start the development server, run:

```sh
bun run dev
```

This will start the server with hot-reloading.

To build the project, run:

```sh
bun run build
```

To start the production server, run:

```sh
bun start
```

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and [Prettier](https://prettier.io/) for formatting.

To lint the code, run:

```sh
bun run lint
```

To fix linting errors, run:

```sh
bun run lint:fix
```

To format the code, run:

```sh
bun run format
```

## Git Hooks

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to manage Git hooks. The following hooks are configured:

- `pre-commit`: Runs `lint:fix` and `format` on staged files before each commit.
- `pre-push`: Runs `lint` before pushing to the remote repository.
- `post-commit`: Shows the changes after each commit.
