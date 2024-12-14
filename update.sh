#!/bin/bash
git pull
docker compose down -f docker-compose.yml
docker compose up --build -d -f docker-compose.yml
