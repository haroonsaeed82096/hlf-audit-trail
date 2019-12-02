echo "=================== WARNING ==================="
echo "  Killing and removing docker containers and images!  "
echo "==============================================="

docker volume prune
docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

echo "=================== WARNING ==================="
echo "  Docker containers are killed and removed!   "
echo "==============================================="