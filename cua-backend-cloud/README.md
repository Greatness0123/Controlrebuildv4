# CUA Backend Cloud

This directory contains a cloud-ready wrapper for the CUA Backend logic.

## Features
- **REST API**: Standard Express.js server for stateless command execution.
- **Scalable**: Designed to be deployed in Docker containers.
- **Security**: Can be easily integrated with JWT or OAuth for remote access.

## Deployment
1. Build the base `cua-backendjs` library.
2. Run `npm install` in this directory.
3. Deploy to your favorite cloud provider (AWS, GCP, Azure) as a container.
