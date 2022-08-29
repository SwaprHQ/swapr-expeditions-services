#!/bin/bash

# Extract build information from git
GIT_COMMIT=$(git rev-parse HEAD)
GIT_TAG=$(git tag --points-at HEAD)
GIT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD | sed 's/[^a-zA-Z0-9]/-/g')

# Use tag if exists, resort to branch name
GIT_REVISION=$GIT_TAG

if [ !$GIT_TAG ]
then
    GIT_REVISION=$GIT_BRANCH_NAME
elif [ !$GIT_BRANCH_NAME ]
then
    GIT_REVISION=$GIT_COMMIT
fi

# Construct Docker image
# DOCKER_TAG=$GIT_REVISION
DOCKER_IMAGE_NAME="swapr-api-services"
DOCKER_IMAGE_TAG="${DOCKER_IMAGE_NAME}:${GIT_REVISION}"

echo "Building ${DOCKER_IMAGE_TAG} @ ${GIT_COMMIT} from ${GIT_REVISION}"

docker build --file ./docker/Dockerfile --tag ${DOCKER_IMAGE_TAG} --build-arg "GIT_COMMIT=${GIT_COMMIT}" --build-arg "GIT_REVISION=${GIT_REVISION}" .