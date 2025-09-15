# Deployment Guide

This guide covers different deployment options for your Audit Dashboard application.

## Quick Deploy Options

### 1. Netlify (Recommended for Frontend)

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Connect your repository
5. Set build command: (leave empty for static site)
6. Set publish directory: `/` (root)
7. Click "Deploy site"

**Custom Domain:**
- Go to Site settings → Domain management
- Add your custom domain
- Configure DNS records

### 2. Vercel (Full-Stack)

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect it's a Node.js project
4. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret-key`
   - `FRONTEND_URL=https://your-app.vercel.app`
5. Deploy

### 3. Railway (Full-Stack)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

## VPS Deployment (Advanced)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSH access

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd audit-dashboard

# Install dependencies
npm install

# Create environment file
nano .env
```

**Environment file (.env):**
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_PATH=./database/audit_dashboard.db
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Step 3: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/audit-dashboard
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files
    location / {
        root /path/to/audit-dashboard;
        index main.html;
        try_files $uri $uri/ =404;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /path/to/audit-dashboard/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/audit-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Start Application

```bash
# Start with PM2
pm2 start server.js --name "audit-dashboard"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
```

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  audit-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - ./uploads:/app/uploads
      - ./database:/app/database
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./uploads:/usr/share/nginx/html/uploads
      - ./:/usr/share/nginx/html
    depends_on:
      - audit-dashboard
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5500
JWT_SECRET=dev-secret-key
```

### Staging
```env
NODE_ENV=staging
PORT=3000
FRONTEND_URL=https://staging.yourdomain.com
JWT_SECRET=staging-secret-key
```

### Production
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=production-super-secret-key
```

## Database Backup

### SQLite Backup
```bash
# Create backup
sqlite3 database/audit_dashboard.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# Restore backup
sqlite3 database/audit_dashboard.db ".restore backup_file.db"
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/path/to/backups"
DB_PATH="/path/to/audit-dashboard/database/audit_dashboard.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/backup_$DATE.db"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "backup_*.db" -mtime +7 -delete

echo "Backup completed: backup_$DATE.db"
```

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs audit-dashboard

# Monitor resources
pm2 monit

# Restart application
pm2 restart audit-dashboard

# Update application
git pull
npm install
pm2 restart audit-dashboard
```

### Health Checks
```bash
# Check API health
curl http://localhost:3000/api/health

# Check application status
pm2 status
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied on uploads**
   ```bash
   sudo chown -R www-data:www-data uploads/
   sudo chmod -R 755 uploads/
   ```

3. **Database locked**
   ```bash
   # Check for running processes
   ps aux | grep node
   # Kill if necessary
   sudo kill -9 <PID>
   ```

4. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Log Locations
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Database backups
- [ ] File upload restrictions
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Set up caching** for static files
3. **Use CDN** for static assets
4. **Optimize images** before upload
5. **Monitor database** performance
6. **Set up monitoring** (PM2 Plus, New Relic, etc.)

## Scaling Considerations

- **Load balancer** for multiple instances
- **Database clustering** for high availability
- **File storage** (AWS S3, Google Cloud Storage)
- **CDN** for global distribution
- **Container orchestration** (Kubernetes)



