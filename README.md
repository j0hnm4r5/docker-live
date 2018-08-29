# Docker Hot Reload

This repo is an example of how to use Docker in development with live-reloading of code and multiple connected services.

## Quick Start

1. Define all your necessary Environment Variables in `.env`, and be sure to update their names across `docker-compose.yml`, `communicator/index.js`, `visuals/src/index.js`, and `visuals/package.json`. The variables defined in the `.env` file will be available in `docker-compose.yml`, as well as within any shell or node processes within the container, and in the browser (via the included Parcel bundler's dotenv support).
2. Change the folder names of your services (in this example, `communicator` is a simple node websocket server, and `visuals` is a simple webpage and websocket client running via Parcel), and be sure to update the relevant lines within `docker-compose.yml`.
3. Build and start the containers from the root of the project with:

```sh
docker-compose up 
```

4. The containers must be completely rebuilt whenever packages are installed or uninstalled. To do this, stop the containers with `docker-compose down`, and then run:

```sh
docker-compose up --force-recreate --build
```

5. View the `visuals` side of the app at `localhost:1234` (unless you changed port numbers in Step 1), and change some things in the code to see the live-reloading in action.

## Why use this?

Libraries like `node-sass` use *native* binaries to run; if you install the dependency on a Mac or Windows machine and simply copy the `node_modules` folder to the container, it will break. To avoid this, you have to run `npm install` from within the container.

We also want to be able to develop on our local machine, but see changes live on the container without having to rebuild it. This is accomplished by mounting the local project to the container as a Bind Volume. This means the container and your local machine share the exact same files and and folders (located on your local machine), and any changes on your local machine are changes in the container as well. The caveat to this is that mounting a volume to a container overwrites any files that were in that location originally.

So, that's where we run into the problem; if you `npm install` on your local machine, and then mount the directory to the container, you'll have the wrong versions of some packages, and things might not work. And if you try to solve the issue by copying over the `package.json` and installing on the container before the volume is mounted, the `node_modules` folder you just created will be hidden when the volume does mount. 

To solve this, we use a combination of normal and Bind-mounted Volumes. Let's look at a selection from one of the service's `Dockerfile`:

```
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install
```

And at the `volumes` section from the `docker-compose.yml`:

```yaml
volumes:
  - ./app/visuals:/app/
  - ./.env:/app/.env
  - /app/node_modules/
```

When `docker-compose up` is run, the `Dockerfile` gets executed first. The `package.json` and `package-lock.json` are copied into the container from the local device, and then `npm install` is run to install the dependencies from within the container. Once that has finished and the container is built, Volumes begin to mount. First, Docker *creates* any require storage volumes. `- /app/node_modules/` means, "mount a volume to /app/node_modules", and since we already have data at that location (from the previous step), [Docker copies](https://docs.docker.com/storage/#tips-for-using-bind-mounts-or-volumes) the existing files into the new volume. Once that step is done, Docker mounts all volumes (including the one that was just created) in lexicographical order (`./app/visuals` to `/app/`, followed by `.env` to `/app/.env`, and then the new volume to `/app/node_modules`).

The end result is that both the container and local device have access to the same files, but the container replaces the local `node_modules` folder with one that was created on the container itself.