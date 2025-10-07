# 🔐 Authentication Setup Guide

The API has been reset and now requires proper authentication for admin functions. Here's how to set up and use the new login system.

## 🚀 Quick Start

### Option 1: Use Default Credentials
1. Open the application in your browser
2. A setup modal will appear automatically on first visit
3. Click "Usar Credenciais Padrão" to use the default admin account
4. The login form will be pre-filled with:
   - **Email:** `lux@2025`
   - **Password:** `admin@2025`
5. Click "Entrar" to login

### Option 2: Create New Admin Account
1. Open the application in your browser
2. Click "Criar Novo Administrador" in the setup modal
3. Fill in the form with your desired credentials
4. Click "Criar Administrador"
5. You'll be automatically logged in with the new account

## 🔧 Features

### Authentication System
- **JWT Token-based authentication** with 24-hour session duration
- **Password hashing** using bcrypt for security
- **Session management** with automatic logout on expiration
- **Token verification** for protected endpoints

### Admin Functions (Require Login)
- ✅ Add news articles
- ✅ Remove news articles
- ✅ Upload audit files
- ✅ Delete audit files
- ✅ Access admin controls

### Public Functions (No Login Required)
- ✅ View news articles
- ✅ View audit statistics
- ✅ View company information
- ✅ Navigate between pages

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client-side)
- `POST /api/auth/create-admin` - Create new admin user
- `PUT /api/auth/update-password` - Update admin password

### Protected Endpoints (Require Authentication)
- `POST /api/news` - Create news article
- `PUT /api/news/:id` - Update news article
- `DELETE /api/news/:id` - Delete news article
- `POST /api/audits/upload` - Upload audit file
- `DELETE /api/audits/:id` - Delete audit file

### Public Endpoints (No Authentication)
- `GET /api/news` - Get all news articles
- `GET /api/audits` - Get all audits
- `GET /api/companies` - Get company information
- `GET /api/audits/stats/overview` - Get audit statistics
- `GET /api/health` - Health check

## 🔒 Security Features

1. **Password Requirements:**
   - Minimum 6 characters
   - Stored as bcrypt hash
   - Password confirmation required

2. **Session Management:**
   - 24-hour token expiration
   - Automatic logout on session expiry
   - Token verification on each request

3. **Input Validation:**
   - Email format validation
   - Password strength requirements
   - CSRF protection through JWT

## 🧪 Testing

Run the test script to verify the authentication system:

```bash
node test-api.js
```

This will test:
- Health check endpoint
- Protected endpoint access without token
- Login with default credentials
- Protected endpoint access with token
- Token verification
- Admin creation

## 🚨 Important Notes

1. **Change Default Credentials:** After first login, change the default password for security
2. **Session Persistence:** Login sessions are stored in localStorage and persist across browser sessions
3. **Token Security:** JWT tokens are stored in localStorage - clear browser data to logout
4. **API Security:** All admin functions now require valid authentication

## 🔄 Reset Authentication

To reset the authentication system:

1. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```

2. Restart the server to reset the database

3. The setup modal will appear again on next visit

## 📱 User Interface

- **Login Button:** Appears in header when not logged in
- **Logout Button:** Appears in header when logged in
- **Setup Modal:** Appears on first visit to guide initial setup
- **Admin Controls:** Only visible when logged in as admin
- **Notifications:** Real-time feedback for all actions

## 🆘 Troubleshooting

### Can't Login
- Verify credentials are correct
- Check if session has expired (24 hours)
- Clear localStorage and try again

### Setup Modal Not Appearing
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### API Errors
- Check server is running
- Verify API endpoints are accessible
- Check browser console for error details

---

**Default Admin Credentials:**
- Email: `lux@2025`
- Password: `admin@2025`

**⚠️ Remember to change these credentials after first login!**
