# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


  

  
# Trip Planner App :earth_africa:	:mountain_snow:

<div style="text-align: center;"> 
 
## :star: Building a Fullstack AI Trip Planner with React, Gemini AI, TailwindCSS & Firebase
 


  ### Features: 

- Environment,Vite set up
- Firebase, Database creation
- Google Authentication
- Generate Trip From Gemini AI
- React Routing
- Shadcn/ui
- LocationIQ for Place Autocomplete
- Display place photo using Google Photo API and Unsplash API
- Full responsiveness on all pages
- Deploy App on Vercel


<br />


## About the Project  :star2:
![11](https://github.com/user-attachments/assets/81bdf33b-95b8-4ba0-b7f6-ab517ec54690)
![3](https://github.com/user-attachments/assets/3d648acd-0c95-4d80-a257-4f1395edade7)
![2](https://github.com/user-attachments/assets/35b35f6e-dbe2-4a3d-88a0-c14536688a4e)
![1](https://github.com/user-attachments/assets/48151eb5-770f-4d8b-8149-c28a12a6fa39) 

<br />

# You can check app this link :point_down:
https://full-stack-ai-trip-planner.vercel.app/


## Setup .env file
### :key: Environment Variables


```js
VITE_GOOGLE_AUTH_CLIENT_ID
VITE_GOOGLE_GEMINI_AI_API_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_UNSPLASH_ACCESS_KEY
``` 

## API Setup

This project requires several API keys to function properly:
1. Google OAuth Client ID - For user authentication
2. Google Gemini AI API Key - For AI-powered trip planning
3. Google Places API Key - For location image fallbacks
4. Unsplash API Key - For high-quality location images

The project already uses a LocationIQ API key for location search.

For detailed instructions on how to obtain and set up all required API keys, please refer to our [API Setup Guide](./API_SETUP_GUIDE.md).

For specific information about the Unsplash API implementation, see the [Unsplash API Setup Guide](./UNSPLASH_API_SETUP.md).

## Google OAuth Setup

To fix the "Missing required parameter client_id" error, follow these steps:

1. Create a `.env` file in the root of your project
2. Add your Google OAuth Client ID to the `.env` file:
   ```
   VITE_GOOGLE_AUTH_CLIENT_ID=your_client_id_here
   ```
3. Obtain a client ID by following the instructions in the [API Setup Guide](./API_SETUP_GUIDE.md)

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the required API keys (see above)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Recent Updates

- Added Unsplash API integration for high-quality location images
- Fixed Google OAuth authentication issues
- Added responsive footer with social links
- Updated logo and branding throughout the application

