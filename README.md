# Video Annotation Tool Backend

This project contains a backend implementation for
the [Video Annotation Tool](https://github.com/NickSettler/video-annotation-tool).
The backend is built using NestJS.

## Deployment

The repository contains Dockerfile with two targets: backend and database.

To build the backend Docker image, run the following command:

```bash
docker build --target backend -t video-annotation-tool-backend .
```

To build the database Docker image, run the following command:

```bash
docker build --target database -t video-annotation-tool-database .
```

The .env.template file contains the required environment variables for the backend. Copy this file to .env and fill in
the necessary values.

### Prebuilt images

The backend is also available as a prebuilt Docker image on Docker Hub. You can pull the image using the following
command:

```bash
docker pull nicksettler/itt-backend
```

The image is available for two architectures: `amd64` and `arm64`. You can specify the architecture when pulling the

### Volumes

The backend Docker image expects a volume to be set as an environment variable. This volume is used to store the
uploaded videos. You can set the volume using the `-v` flag when running the container.

```bash
docker run -p 3000:3000 -v /path/to/videos:/<UPLOADS_LOCATION> video-annotation-tool-backend
```

