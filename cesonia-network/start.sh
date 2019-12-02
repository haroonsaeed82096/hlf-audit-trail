echo "====================== WARNING ======================="
echo "  Killing and removing existing docker containers....!"
echo "======================================================"
sleep 5

docker volume prune
docker kill $(docker ps -aq)
docker rm $(docker ps -aq)
sleep 2
echo "==============================================="
echo "  All containers are killed and removed.......!"
echo "==============================================="
sleep 5
echo " "

echo "===================================================================="
echo "  Setting up environment variables required to run the network.....!"
echo "===================================================================="
echo " "
sleep 5

echo "exporting system channel variable.....!"
export SYS_CHANNEL=cesoniachannel
sleep 2

echo "exporting FABRIC_CFG_PATH.............!"
export FABRIC_CFG_PATH=$PWD
sleep 2


echo "exporting channel name................!"
export CHANNEL_NAME=twoorgchannel
sleep 2

echo "setting home_directory................!"
export home_directory=$PWD
sleep 2

echo " "
echo "======================================="
echo "  All environment variables are set...!"
echo "======================================="
sleep 2

echo " "
echo "====================================================="
echo "  Creating volumes for orderer, peers and couchDB...!"
echo "====================================================="
sleep 5
echo " "


docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d

sleep 3
echo " "
echo "============================================"
echo "....................Success................!"
echo "============================================"
sleep 2
echo " "

echo " "
echo "=============================================================================="
echo "....................Getting the details of running containers................!"
echo "=============================================================================="
sleep 5
docker ps -a
