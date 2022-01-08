Welcome! Vanellus is the official Kiebitz Typescript library that acts as an
interface to the Kiebitz backend services and provides necessary functionality
for building end-to-end encrypted applications with Kiebitz.

# Requirements

To run this library in the browser you'll need the `buffer` package, which implement the `Buffer` object from Node.js.

# Building

To build the distribution files, simply run

```bash
make build
```

# Formatting

To format files, simply run

```bash
make prettier
```

# Development

To continuously build files and watch for changes, simply run

```bash
make watch
```

# Testing

To run the unit & integration tests

```bash
make test
```

These tests require a running Kiebitz test instance with appointments and storage services, as well as a readable `002_admin.json` key file in the Kiebitz settings directory. The default directory is `../services/settings/test`. You can change the directory and service ports by setting the `KIEBITZ_SETTINGS`, `KIEBITZ_APPOINTMENTS_PORT` and `KIEBITZ_STORAGE_PORT` environment variables.
