docker kill $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume prune