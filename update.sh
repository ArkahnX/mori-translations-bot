#!/bin/bash
#Pull from git repo
git pull
#Shut down services with compose
docker compose down -f docker-compose.yml
#Create new services rebuilding the image used from scratch by doing from ts code  > .js with node
docker compose up --build -d -f docker-compose.yml
