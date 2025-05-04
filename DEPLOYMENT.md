# Deploying SearchIt to Vercel

This guide walks you through deploying the SearchIt application frontend to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. Your backend API deployed on Render.com at https://searchit-backend.onrender.com
3. Git repository with your code

## Deployment Steps

### 1. Prepare Your Code

- Make sure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
- The `vercel.json` file is already configured for your deployment

### 2. Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Build Command**: next build
   - **Output Directory**: .next
   - **Install Command**: npm install

### 3. Environment Variables

The environment variables are already configured in your `vercel.json` file:

```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://searchit-backend.onrender.com/api"
  }
}
```

No additional configuration is needed during deployment.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Test Your Deployment

Once deployed, test your application by:
- Creating an account
- Logging in with your credentials
- Uploading images
- Searching for images
- Purchasing images

### 6. Setting Up Custom Domain (Optional)

If you want to use a custom domain:
1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your domain and follow the verification steps

## Troubleshooting

- **CORS issues**: Your backend is already configured to accept requests from multiple origins
- **API Connection Issues**: If you have connection issues, verify that the backend service at searchit-backend.onrender.com is running
- **Authentication Problems**: Ensure that you're navigating to the login page correctly

## Backend Configuration

Your backend is configured to allow CORS from your Vercel domain. The relevant configuration is:

```python
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001')
CORS(app, resources={r"/api/*": {"origins": cors_origins.split(','), "supports_credentials": True}})
```

If you deploy to a custom domain, add your domain to the CORS origins environment variable on your backend deployment. 