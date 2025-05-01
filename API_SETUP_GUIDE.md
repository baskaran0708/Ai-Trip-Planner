# API Setup Guide for Trip Planner App

This guide will walk you through setting up all the required API keys for the Trip Planner application.

## Required API Keys

The Trip Planner app requires four API keys:

1. **Google OAuth Client ID** - For user authentication
2. **LocationIQ API Key** - For location search and autocomplete (already set up with `pk.e438e1b3aa59a3139211392a75fbc40d`)
3. **Google Gemini AI API Key** - For AI-powered trip planning
4. **Unsplash API Key** - For fetching high-quality location images

## Step 1: Set Up Google Cloud Project

Before getting the Google OAuth Client ID, you need to create a Google Cloud project:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "Trip Planner App")
4. Click "Create"

## Step 2: Google OAuth Client ID Setup

This API key allows users to sign in with their Google accounts.

1. In your Google Cloud project, navigate to "APIs & Services" > "Credentials"
2. Click "Configure Consent Screen" at the top
3. Select "External" user type (unless you're limiting to a Google Workspace organization)
4. Fill in the required app information:
   - App name: "Trip Planner"
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On the Scopes page, add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Save and Continue", then "Back to Dashboard"
8. Go to "Credentials" and click "Create Credentials" > "OAuth client ID"
9. Select "Web application" as the application type
10. Name: "Trip Planner Web Client"
11. Add Authorized JavaScript origins:
    - `http://localhost:5173` (for local development)
    - Your production URL (if deployed)
12. Add Authorized redirect URIs:
    - `http://localhost:5173` (for local development)
    - Your production URL (if deployed)
13. Click "Create"
14. Copy your Client ID (you'll need this for your `.env` file)

## Step 3: LocationIQ API Setup

We're using a LocationIQ API key for location search functionality. The key is already implemented in the code:

```
pk.e438e1b3aa59a3139211392a75fbc40d
```

This key is free to use with certain limits. If you need your own key:

1. Go to [LocationIQ](https://locationiq.com/)
2. Sign up for a free account
3. After signing up, navigate to your dashboard
4. Your API key will be displayed there
5. Copy your API key if you want to replace the existing one in the code

## Step 4: Google Gemini AI API Key Setup

This API key powers the AI trip planning functionality.

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on your profile icon in the top-right corner
4. Select "Get API key"
5. If you already have a key, it will be displayed; otherwise, click "Create API key"
6. Copy your API key (you'll need this for your `.env` file)

## Step 5: Unsplash API Key Setup

The Unsplash API is used to fetch high-quality location images for trips.

1. Go to the [Unsplash Developer Portal](https://unsplash.com/developers)
2. Sign up for a developer account if you don't have one
3. Create a new application in your developer dashboard
4. Fill in the required information about your application:
   - Application name: "Trip Planner"
   - Description: "An AI-powered trip planning application that uses Unsplash for location images"
   - Select "Demo" for development purposes
5. Accept the terms and create the application
6. You'll be given an **Access Key** - copy this key (you'll need this for your `.env` file)

For more detailed information about the Unsplash API setup and usage, please refer to our [Unsplash API Setup Guide](./UNSPLASH_API_SETUP.md).

## Step 6: Set Up Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add the following variables with your API keys:

```
VITE_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id_here
VITE_GOOGLE_GEMINI_AI_API_KEY=your_gemini_ai_api_key_here
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

3. Replace each value with the actual API keys you obtained in the previous steps
4. Save the file
5. Note: The LocationIQ API key is already hardcoded in the application, so you don't need to add it to the `.env` file

## Step 7: Install Required Packages

Make sure you have all required packages installed:

```bash
# Install the Unsplash API package if not already installed
npm install unsplash-js
```

## Step 8: Restart Your Development Server

After adding all API keys to your `.env` file and installing required packages, restart your development server:

```bash
npm run dev
```

## Troubleshooting

### Google Authentication Issues
- Make sure your OAuth consent screen is properly configured
- Verify that the authorized JavaScript origins match your actual URL
- Check that you're using the correct Client ID in your `.env` file

### LocationIQ API Issues
- If you're experiencing rate limiting, you may need to create your own LocationIQ account
- The default key is limited to 5,000 requests per day
- Check the browser console for specific error messages

### Gemini AI API Issues
- Verify your API key is correct
- Ensure you're within the usage limits for the API
- Check the browser console for specific error messages

### Unsplash API Issues
- Verify your Access Key is correctly added to the `.env` file
- Check if you've exceeded the API rate limits (50 requests per hour, 1,000 per day on the free plan)
- Ensure you're maintaining the required attribution for all Unsplash images
- See [Unsplash API Setup Guide](./UNSPLASH_API_SETUP.md) for more troubleshooting tips

## Security Considerations

- Never commit your `.env` file to version control
- Consider replacing the hardcoded LocationIQ API key with your own key through environment variables for production deployments
- Always restrict API keys to specific APIs and domains
- Consider setting up API key rotation for production environments 