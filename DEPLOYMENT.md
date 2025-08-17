# Deployment Guide

## Production Deployment

### Build the Application
```bash
npm run build
```

### Deploy to Static Hosting
The application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3 + CloudFront**: Upload build files
- **GitHub Pages**: Use GitHub Actions workflow

### Environment Configuration
Set these environment variables for production:
- `VITE_APP_VERSION`: Application version
- `VITE_MAX_FILE_SIZE`: Maximum file size (default: 120MB)

## Local Development
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`