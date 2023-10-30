#!/bin/bash

# Build the Docker image
docker build -t myimage .

# Run the Docker container
docker run -p 8080:8080 --name forum myimage
