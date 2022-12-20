ssh -i "~/.ssh/matt-aws.pem" ubuntu@ec2-18-206-254-145.compute-1.amazonaws.com


sudo apt update
sudo apt upgrade -y

sudo -i
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
exit

wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

sleep 2
sudo systemctl enable mongod
sudo systemctl start mongod

echo "license_key: e6eea7d5df2e9c109c0dae8a7cddff6b867eNRAL" | sudo tee -a /etc/newrelic-infra.yml
curl -s https://download.newrelic.com/infrastructure_agent/gpg/newrelic-infra.gpg | sudo apt-key add -
printf "deb https://download.newrelic.com/infrastructure_agent/linux/apt/ jammy main" | sudo tee -a /etc/apt/sources.list.d/newrelic-infra.list
sudo apt update
sudo apt install -y libcap2-bin
sudo NRIA_MODE="PRIVILEGED" apt-get install newrelic-infra

sleep 1
curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=NRAK-GF5KMUN3NHHZJ37EM2RYPUS2418 NEW_RELIC_ACCOUNT_ID=3727666 /usr/local/bin/newrelic install -n mongodb-open-source-integration

sudo ufw allow from 172.31.0.0/16 port 27017


##############################################

scp -i "~/.ssh/matt-aws.pem" -C questions.json ubuntu@ec2-18-206-254-145.compute-1.amazonaws.com:/home/ubuntu/exports/
scp -i "~/.ssh/matt-aws.pem" -C answers.json ubuntu@ec2-18-206-254-145.compute-1.amazonaws.com:/home/ubuntu/exports/

mongoimport --db=sdc --collection=questions --drop --type=json --file=./exports/questions.json mongodb://127.0.0.1:27017/
mongoimport --db=sdc --collection=answers --drop --type=json --file=./exports/answers.json mongodb://127.0.0.1:27017/
