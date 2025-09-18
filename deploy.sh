#!/bin/bash
set -e

echo "🔁 Pulling latest code..."
git pull origin main || true

echo "📦 Building Docker containers..."
sudo docker compose build --no-cache

echo "🚀 Starting containers..."
sudo docker compose up -d

# Cấu hình Nginx nếu chưa có
if [ ! -f /etc/nginx/sites-available/nothatphuquy ]; then
  echo "🌐 Setting up Nginx..."
  sudo bash -c 'cat > /etc/nginx/sites-available/nothatphuquy <<EOF
server {
    listen 80;
    server_name noithatphuquy.id.vn www.noithatphuquy.id.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'
  sudo ln -s /etc/nginx/sites-available/nothatphuquy /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl restart nginx
fi

# Xin SSL nếu chưa có
if [ ! -d /etc/letsencrypt/live/noithatphuquy.id.vn ]; then
  echo "🔐 Getting SSL certificate..."
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d noithatphuquy.id.vn -d www.noithatphuquy.id.vn
fi

echo "✅ Deploy completed! Visit: https://noithatphuquy.id.vn"