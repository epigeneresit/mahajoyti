# Production Deployment Guide

## 🚀 Production Setup Checklist

### 1. Environment Configuration

1. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with production values:**
   ```env
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/excelData
   ALLOWED_ORIGINS=https://yourdomain.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### 2. Security Checklist

- ✅ **Helmet** - Security headers enabled
- ✅ **CORS** - Configured with allowed origins
- ✅ **Rate Limiting** - Protects against DDoS
- ✅ **Input Validation** - File type and size validation
- ✅ **Error Handling** - Production-safe error messages
- ⚠️ **HTTPS** - Configure SSL/TLS certificate (recommended)
- ⚠️ **Firewall** - Configure firewall rules
- ⚠️ **MongoDB Authentication** - Enable auth on MongoDB

### 3. Database Setup

1. **Ensure MongoDB is running:**
   ```bash
   # Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Create database backup strategy:**
   ```bash
   # Example backup command
   mongodump --db excelData --out ./backups/$(date +%Y%m%d)
   ```

3. **Enable MongoDB authentication (recommended):**
   ```javascript
   // In MongoDB shell
   use admin
   db.createUser({
     user: "apiUser",
     pwd: "securePassword",
     roles: [{ role: "readWrite", db: "excelData" }]
   })
   
   // Update MONGODB_URI in .env
   MONGODB_URI=mongodb://apiUser:securePassword@localhost:27017/excelData
   ```

### 4. Performance Optimization

- ✅ **Compression** - Enabled for response compression
- ✅ **Database Indexes** - Aadhaar number indexed
- ✅ **Pagination** - Implemented for large datasets
- ✅ **Connection Pooling** - Mongoose default pooling
- 💡 **Consider adding Redis** - For caching frequently accessed data

### 5. Monitoring & Logging

- ✅ **Access logs** - Saved to `logs/access.log`
- ✅ **Error logging** - Console error tracking
- ✅ **Graceful shutdown** - Handles SIGTERM/SIGINT
- 💡 **Consider adding:**
  - PM2 for process management
  - Winston for structured logging
  - New Relic/DataDog for monitoring

### 6. Running in Production

**Option 1: Direct Node (Development/Testing)**
```bash
npm start
```

**Option 2: Using startup script**
```bash
# Windows
.\start-production.bat

# Linux/Mac
chmod +x start-production.sh
./start-production.sh
```

**Option 3: Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name excel-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs excel-api

# Restart
pm2 restart excel-api
```

### 7. Reverse Proxy Setup (Nginx)

**Example Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Upload size limit
        client_max_body_size 10M;
    }
}
```

### 8. Docker Deployment (Optional)

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/excelData
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

**Run with Docker:**
```bash
docker-compose up -d
```

### 9. Testing Production Build

1. **Test file upload:**
   ```bash
   curl -X POST -F "file=@test.xlsx" http://localhost:3001/api/upload
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:3001/api/data
   curl http://localhost:3001/api/stats
   ```

3. **Check rate limiting:**
   - Make multiple rapid requests to verify rate limiting works

4. **Check logs:**
   ```bash
   cat logs/access.log
   ```

### 10. Maintenance

**Regular tasks:**
- Monitor disk space (logs and uploads)
- Backup database regularly
- Update dependencies: `npm audit fix`
- Monitor error logs
- Review access logs for suspicious activity

**Updating the application:**
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Restart application
pm2 restart excel-api
```

### 11. Troubleshooting

**MongoDB connection issues:**
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Check logs
tail -f logs/access.log
```

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3001

# Linux
lsof -i :3001
```

**High memory usage:**
```bash
# Check PM2 memory usage
pm2 monit

# Restart if needed
pm2 restart excel-api
```

### 12. Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use strong MongoDB passwords**
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Enable HTTPS** - Use Let's Encrypt for free SSL
5. **Limit file upload size** - Already set to 10MB
6. **Regular backups** - Automate MongoDB backups
7. **Monitor logs** - Watch for unusual activity
8. **Use firewall** - Restrict access to MongoDB port

---

## 📊 Production URLs

- **Frontend:** http://localhost:3001
- **API Base:** http://localhost:3001/api
- **Upload:** http://localhost:3001/api/upload
- **Get Data:** http://localhost:3001/api/data
- **Statistics:** http://localhost:3001/api/stats

---

## 🆘 Support

For issues or questions:
1. Check logs in `logs/access.log`
2. Review error messages in console
3. Verify .env configuration
4. Ensure MongoDB is running
5. Check firewall and port settings

---

**Last Updated:** November 2025
