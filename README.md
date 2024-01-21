# Alpha Upload

## Build

Using [nvm](https://github.com/nvm-sh/nvm) is highly recommended for managing Node.js versions. To install and use the latest supported version of Node and npm, run:

```sh
nvm install --latest-npm
```

To switch to the supported version from another, run:

```sh
nvm use
```

If you attempt to use an unsupported Node or npm version, this project will fail to build with an `Unsupported engine` error. If not using `nvm`, check the `engines` block of `package.json` for the supported versions.

To install and rebuild dependencies:

```sh
npm install
```

To start the Electron app:

```sh
npm run build
npm run electron
```

To build the Electron app for your system:

```sh
npm run dist
```

> Tested with Node.js v20.11.0 and npm 10.3.0.
