ssh -i "~/.ssh/matt-aws.pem" ubuntu@ec2-3-84-195-133.compute-1.amazonaws.com

sudo apt update
sudo apt upgrade -y

sudo apt update
sudo apt install -y npm

npm install pm2

git clone 'https://malexander6@github.com/rpp2205-sdc-danakil/matt-qa.git'
cd matt-qa

