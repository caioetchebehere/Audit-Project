# 🚀 Complete Deployment Guide - Audit Dashboard

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] A code repository (GitHub/GitLab)
- [ ] A deployment platform account (choose one below)

---

## 🎯 Quick Deploy Options (Recommended)

### Option 1: Vercel (Easiest - Full Stack)

**Why Vercel?** Handles both frontend and backend automatically.

#### Step 1: Prepare Your Code
```bash
# 1. Make sure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect it's a Node.js project
6. Configure settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm install`
   - **Output Directory:** `./` (root)
   - **Install Command:** `npm install`

#### Step 3: Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-app-name.vercel.app
PORT=3000
```

#### Step 4: Deploy
- Click "Deploy"
- Wait for deployment to complete
- Your app will be available at `https://your-app-name.vercel.app`

---

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify

**Step 1: Deploy Frontend**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Select your repository
5. Configure:
   - **Build command:** (leave empty)
   - **Publish directory:** `./` (root)
   - **Index file:** `main.html`
6. Click "Deploy site"

**Step 2: Update API URLs**
After deployment, update your JavaScript files to use the backend URL:
```javascript
// In js/api.js, change the base URL
const API_BASE_URL = 'https://your-backend.railway.app/api';
```

#### Backend on Railway

**Step 1: Deploy Backend**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js

**Step 2: Configure Environment Variables**
In Railway dashboard → Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-frontend.netlify.app
PORT=3000
```

**Step 3: Deploy**
- Railway will automatically deploy
- Get your backend URL (e.g., `https://your-app.railway.app`)

---

## 🖥️ VPS Deployment (Advanced)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSH access

### Step 1: Server Setup

```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y
```

### Step 2: Clone and Setup Application

```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

# Create environment file
nano .env
```

**Environment file (.env):**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_PATH=./database/audit_dashboard.db
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Step 3: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/audit-dashboard
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files
    location / {
        root /root/your-repo-name;
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
        alias /root/your-repo-name/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/audit-dashboard /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 4: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
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

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

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

### Step 2: Create docker-compose.yml

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
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./uploads:/usr/share/nginx/html/uploads
      - ./:/usr/share/nginx/html
    depends_on:
      - audit-dashboard
    restart: unless-stopped
```

### Step 3: Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Local Development Setup

### Step 1: Install Dependencies
```bash
# Clone repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install
```

### Step 2: Start Development Server
```bash
# Option 1: Use the start script
node start.js

# Option 2: Start manually
npm run dev
```

### Step 3: Access Application
- **Frontend:** Open `main.html` in your browser
- **Backend API:** `http://localhost:3000/api`
- **Health Check:** `http://localhost:3000/api/health`

---

## 🔐 Security Configuration

### Essential Security Steps

1. **Change Default Credentials**
   ```javascript
   // In database/init.js, update admin credentials
   const adminUser = {
     email: 'your-email@company.com',
     password: 'your-secure-password'
   };
   ```

2. **Set Strong JWT Secret**
   ```env
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   ```

3. **Configure CORS**
   ```javascript
   // In server.js, update CORS origin
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
     credentials: true
   }));
   ```

---

## 📊 Monitoring and Maintenance

### PM2 Commands (VPS)
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

---

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission Denied on Uploads**
   ```bash
   sudo chown -R www-data:www-data uploads/
   sudo chmod -R 755 uploads/
   ```

3. **Database Locked**
   ```bash
   ps aux | grep node
   sudo kill -9 <PID>
   ```

4. **Nginx Configuration Errors**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 📝 Post-Deployment Checklist

- [ ] Test all functionality
- [ ] Verify file uploads work
- [ ] Check admin login
- [ ] Test API endpoints
- [ ] Verify SSL certificate (if using)
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update DNS records
- [ ] Test from different devices

---

## 🎉 You're Done!

Your Audit Dashboard should now be live and accessible. Choose the deployment method that best fits your needs:

- **Quick & Easy:** Vercel (recommended for beginners)
- **Flexible:** Netlify + Railway
- **Full Control:** VPS deployment
- **Containerized:** Docker deployment

For any issues, check the troubleshooting section or refer to the platform-specific documentation.
