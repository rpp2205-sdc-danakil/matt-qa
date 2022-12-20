ssh -i "matt-aws.pem" ubuntu@ec2-3-86-240-120.compute-1.amazonaws.com

sudo apt update
sudo apt upgrade

sudo apt install nginx
sudo ufw allow 'Nginx Full'

sudo echo '
# Define which servers to include in the load balancing scheme.
# Its best to use the servers private IPs for better performance and security.
# You can find the private IPs at your UpCloud control panel Network section.
http {
   upstream backend {
      server 10.1.0.101;
      server 10.1.0.102;
      server 10.1.0.103;
   }

   # This server accepts all traffic to port 80 and passes it to the upstream.
   # Notice that the upstream name and the proxy_pass need to match.

   server {
      listen 80;

      location / {
          proxy_pass http://backend;
      }
   }
}
' > '/etc/nginx/sites-available/load-balancer.conf'