# Unsplash API Setup Guide

This guide explains how to set up the Unsplash API for the Trip Planner application to fetch beautiful location images.

## Getting an Unsplash API Key

1. Go to the [Unsplash Developer Portal](https://unsplash.com/developers)
2. Sign up for a developer account if you don't have one
3. Create a new application in your developer dashboard
4. Fill in the required information about your application:
   - Application name: "Trip Planner"
   - Description: "An AI-powered trip planning application that uses Unsplash for location images"
   - Select "Demo" for development purposes
5. Accept the terms and create the application
6. You'll be given an **Access Key** - copy this key

## Adding the Unsplash API Key to Your Project

1. Create a `.env` file in the root of your project if it doesn't exist already
2. Add the following line to your `.env` file:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   ```
3. Replace `your_unsplash_access_key_here` with the actual Access Key you received
4. Restart your development server if it's running

## Unsplash API Usage Information

- The free Unsplash API has the following rate limits:
  - 50 requests per hour
  - 1,000 requests per day
- The Trip Planner app fetches images in two places:
  1. When a user selects a location in the trip creation form
  2. When viewing trip details (if not already fetched during creation)
- Each API request includes proper attribution to the photographer as required by Unsplash

## API Upgrade Options

If you need higher rate limits, consider upgrading to Unsplash's Production plan:

1. Complete your application in the Unsplash Developer portal
2. Fill out the Production application form
3. Once approved, you'll get higher rate limits suitable for production use

## Troubleshooting

### No Images Appearing
- Check your browser console for API errors
- Verify your Access Key is correctly added to the `.env` file
- Ensure you haven't exceeded the API rate limits

### API Rate Limit Issues
- Implement caching for frequently accessed locations
- Consider upgrading to a higher-tier plan if needed for production

### Image Attribution
- Always maintain the Unsplash attribution shown below images
- This is a requirement of the Unsplash API terms of service 