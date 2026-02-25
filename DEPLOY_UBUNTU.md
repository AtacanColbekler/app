# Ubuntu Server Deployment Guide (Frontend + FastAPI Backend)

This project has:
- A **React frontend** (`frontend/`)
- A **FastAPI backend** (`backend/server.py`)
- A **MongoDB dependency** via environment variables (`MONGO_URL`, `DB_NAME`)

This guide shows a production setup on a fresh Ubuntu server using:
- **Nginx** (public web server)
- **systemd + uvicorn** (backend process manager)
- **Node.js** only for building frontend assets
- **MongoDB Community Server** running on the same machine (with optional app user)

---

## 1) Prepare your server

SSH into your server:

```bash
ssh <your-user>@<server-ip>
```

Update packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install required system packages:

```bash
sudo apt install -y git nginx python3 python3-venv python3-pip ufw curl
```

Enable and start Nginx:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 2) Install Node.js (for frontend build)

Install Node 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

---

## 3) Clone your project

```bash
cd /var/www
sudo git clone <your-repo-url> app
sudo chown -R $USER:$USER /var/www/app
cd /var/www/app
```

---

## 4) Install MongoDB on the same Ubuntu server

Because you do not have MongoDB yet, install it locally on this server.

Import MongoDB GPG key:

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
```

Add MongoDB apt repository:

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

Install and start MongoDB:

```bash
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

Check status:

```bash
sudo systemctl status mongod
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Optional but recommended: create dedicated database + app user

Open shell:

```bash
mongosh
```

Run:

```javascript
use zenxdb
db.createUser({
  user: "zenxapp",
  pwd: "CHANGE_THIS_STRONG_PASSWORD",
  roles: [{ role: "readWrite", db: "zenxdb" }]
})
```

Then enable auth in MongoDB config:

```bash
sudo cp /etc/mongod.conf /etc/mongod.conf.bak
sudo tee -a /etc/mongod.conf > /dev/null << 'EOF'

security:
  authorization: enabled
EOF
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

Test login:

```bash
mongosh "mongodb://zenxapp:CHANGE_THIS_STRONG_PASSWORD@127.0.0.1:27017/zenxdb?authSource=zenxdb" --eval "db.runCommand({ ping: 1 })"
```

---

## 5) Configure backend environment variables

The backend loads `.env` from the `backend/` folder.

Create file:

```bash
cat > /var/www/app/backend/.env << 'EOFENV'
MONGO_URL=mongodb://zenxapp:CHANGE_THIS_STRONG_PASSWORD@127.0.0.1:27017/zenxdb?authSource=zenxdb
DB_NAME=zenxdb
CORS_ORIGINS=https://<your-domain>,http://<server-ip>
EOFENV
```

> Notes:
> - `CORS_ORIGINS` accepts comma-separated origins.
> - For production, use your real domain in `CORS_ORIGINS`.
> - If you choose to run MongoDB without auth (not recommended), you can use: `MONGO_URL=mongodb://127.0.0.1:27017`.

---

## 6) Setup Python virtual environment and backend dependencies

```bash
cd /var/www/app/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Test backend manually:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

Open another SSH session and verify:

```bash
curl http://127.0.0.1:8000/api/
```

Stop uvicorn with `Ctrl+C`.

---

## 7) Create systemd service for FastAPI

Create service file:

```bash
sudo tee /etc/systemd/system/zenx-backend.service > /dev/null << 'EOFSVC'
[Unit]
Description=zenXteknoloji FastAPI backend
After=network.target

[Service]
User=%i
Group=www-data
WorkingDirectory=/var/www/app/backend
Environment="PATH=/var/www/app/backend/.venv/bin"
ExecStart=/var/www/app/backend/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOFSVC
```

Replace `%i` with your real Linux username:

```bash
sudo sed -i "s/User=%i/User=$USER/" /etc/systemd/system/zenx-backend.service
```

Reload and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable zenx-backend
sudo systemctl start zenx-backend
```

Check status/logs:

```bash
sudo systemctl status zenx-backend
journalctl -u zenx-backend -f
```

---

## 8) Build frontend for production

The frontend expects `REACT_APP_BACKEND_URL` at build time.

```bash
cd /var/www/app/frontend
cat > .env.production << 'EOFENV'
REACT_APP_BACKEND_URL=https://<your-domain>
EOFENV

npm install
npm run build
```

This creates static files in:

```text
/var/www/app/frontend/build
```

---

## 9) Configure Nginx (serve frontend + proxy `/api`)

Create Nginx site file:

```bash
sudo tee /etc/nginx/sites-available/zenx > /dev/null << 'EOFNGINX'
server {
    listen 80;
    server_name <your-domain> <server-ip>;

    root /var/www/app/frontend/build;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri /index.html;
    }

    # Backend API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOFNGINX
```

Enable site and test config:

```bash
sudo ln -s /etc/nginx/sites-available/zenx /etc/nginx/sites-enabled/zenx
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10) Configure firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 11) (Recommended) Enable HTTPS with Let's Encrypt

Install certbot plugin:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Issue certificate:

```bash
sudo certbot --nginx -d <your-domain> -d www.<your-domain>
```

Test auto-renew:

```bash
sudo certbot renew --dry-run
```

After HTTPS is enabled, rebuild frontend with HTTPS backend URL if needed:

```bash
cd /var/www/app/frontend
cat > .env.production << 'EOFENV'
REACT_APP_BACKEND_URL=https://<your-domain>
EOFENV
npm run build
sudo systemctl reload nginx
```

---

## 12) Verify deployment

Backend health/root endpoint:

```bash
curl https://<your-domain>/api/
```

Categories endpoint:

```bash
curl https://<your-domain>/api/categories
```

Open site in browser:

```text
https://<your-domain>
```

---

## 13) Update workflow (after code changes)

```bash
cd /var/www/app
git pull

# Backend update
cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart zenx-backend

# Frontend update
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## Common issues and fixes

1. **Frontend loads but API calls fail**
   - Check `REACT_APP_BACKEND_URL` in `frontend/.env.production`.
   - Rebuild frontend after changing env file.

2. **502 Bad Gateway on `/api`**
   - Backend service not running or wrong port.
   - Check: `sudo systemctl status zenx-backend`.

3. **CORS errors**
   - Add your exact origin(s) to `backend/.env` `CORS_ORIGINS`.
   - Restart backend service after changes.

4. **Mongo connection/auth errors**
   - Validate `MONGO_URL`, username/password, and `authSource`.
   - Check MongoDB service: `sudo systemctl status mongod`.

5. **Nginx config errors**
   - Run `sudo nginx -t` before reload.

---

## Optional hardening

- Create a dedicated Linux user for app runtime (instead of your login user).
- Restrict SSH (disable password login, use keys only).
- Enable automatic security updates (`unattended-upgrades`).
- Use external managed MongoDB backups and monitoring.
