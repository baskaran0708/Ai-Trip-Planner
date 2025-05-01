import axios from "axios"
import { createApi } from 'unsplash-js';

const BASE_URL ='https://places.googleapis.com/v1/places:searchText'

const config={
    headers:{
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': [
            'places.photos',
            'places.displayName',
            'places.id'
        ]
    }
}

// Unsplash API setup
const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
});

export const GetPlaceDetails=(data)=>axios.post(BASE_URL,data,config)
export const PHOTO_REF_URL = `https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`;

// Unsplash API methods
export const searchUnsplashImages = (query, count = 3) => {
  return unsplash.search.getPhotos({
    query,
    perPage: count,
    orientation: 'landscape',
  });
};

export const getRandomUnsplashImage = (query) => {
  return unsplash.photos.getRandom({
    query,
    orientation: 'landscape',
  });
};