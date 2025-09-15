# Audit-Project
# Audit Dashboard

A comprehensive audit management system for tracking compliance across multiple companies (Carol, Grand Vision, and SunglassHut).

## Features

- **Multi-Company Dashboard**: Track audits across three companies
- **File Upload System**: Upload audit documents (PDF, DOC, DOCX, XLS, XLSX, CSV)
- **Real-time Statistics**: Pie charts and analytics for audit status
- **News Management**: Admin-controlled news center
- **Secure Authentication**: JWT-based admin authentication
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Responsive design with CSS Grid and Flexbox

### Backend
- Node.js with Express.js
- SQLite database
- JWT authentication
- Multer for file uploads
- Express validation and security middleware

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd audit-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

4. **Open the frontend**
   - Open `Untitled-1.html` in your browser
   - Or serve it with a local server (recommended)

### Default Admin Credentials
- **Email**: admin@2025
- **Password**: audit@2025

## Project Structure

```
audit-dashboard/
├── frontend/
│   ├── Untitled-1.html          # Main dashboard
│   ├── carol.html               # Carol company page
│   ├── grand-vision.html        # Grand Vision company page
│   ├── sunglass-hut.html        # SunglassHut company page
│   ├── styles.css               # Main styles
│   ├── company-styles.css       # Company page styles
│   ├── scripts.js               # Main dashboard logic
│   ├── company-scripts.js       # Company page logic
│   └── js/
│       └── api.js               # API integration
├── backend/
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   ├── database/
│   │   └── init.js              # Database initialization
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── audits.js            # Audit management routes
│   │   ├── news.js              # News management routes
│   │   └── companies.js         # Company routes
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   └── uploads/                 # File upload directory
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify token

### Companies
- `GET /api/companies` - Get all companies with statistics
- `GET /api/companies/:id` - Get company by ID
- `GET /api/companies/name/:name` - Get company by name
- `GET /api/companies/:id/audits` - Get company audits

### Audits
- `GET /api/audits` - Get all audits (with filtering)
- `GET /api/audits/:id` - Get audit by ID
- `POST /api/audits/upload` - Upload new audit
- `DELETE /api/audits/:id` - Delete audit
- `GET /api/audits/stats/overview` - Get audit statistics

### News
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get news by ID
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)

## Deployment Options

### Option 1: Static Hosting (Frontend Only)
For a quick deployment without backend:

1. **Netlify** (Recommended)
   - Drag and drop your frontend files to Netlify
   - Your site will be live at `https://your-site.netlify.app`

2. **Vercel**
   - Connect your GitHub repository
   - Automatic deployments on push

3. **GitHub Pages**
   - Push to GitHub repository
   - Enable Pages in repository settings

### Option 2: Full-Stack Deployment

#### Heroku
1. Create `Procfile`:
   ```
   web: node server.js
   ```

2. Deploy:
   ```bash
   git add .
   git commit -m "Initial commit"
   heroku create your-app-name
   git push heroku main
   ```

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### DigitalOcean App Platform
1. Connect repository
2. Configure build settings
3. Set environment variables

### Option 3: VPS Deployment

1. **Set up server** (Ubuntu/CentOS)
2. **Install Node.js and dependencies**
3. **Configure reverse proxy** (Nginx)
4. **Set up SSL** (Let's Encrypt)
5. **Configure PM2** for process management

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./database/audit_dashboard.db
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Security Considerations

1. **Change default credentials** in production
2. **Use strong JWT secret**
3. **Enable HTTPS** in production
4. **Configure CORS** properly
5. **Set up file upload limits**
6. **Regular database backups**

## Development

### Running in Development Mode

1. **Backend**:
   ```bash
   npm run dev
   ```

2. **Frontend**: Use a local server
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   ```

### Adding New Features

1. **Backend**: Add routes in `/routes/` directory
2. **Frontend**: Update API calls in `js/api.js`
3. **Database**: Modify schema in `database/init.js`

## Troubleshooting

### Common Issues

1. **CORS errors**: Check `FRONTEND_URL` environment variable
2. **File upload fails**: Check file size limits and permissions
3. **Database errors**: Ensure SQLite is properly initialized
4. **Authentication issues**: Verify JWT secret and token expiration

### Logs

- Backend logs: Check console output
- Frontend errors: Check browser console
- File uploads: Check `/uploads` directory permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository




