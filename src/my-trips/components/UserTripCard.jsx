import { GetPlaceDetails, PHOTO_REF_URL, searchUnsplashImages } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

function UserTripCard({trip}) {
  const [photoUrl, setPhotoUrl] = useState();
  const [unsplashImage, setUnsplashImage] = useState(null);
  const [showAttribution, setShowAttribution] = useState(false);

  useEffect(() => {
    if (trip) {
      // Check if we have Unsplash images in the trip data
      if (trip.locationImages && trip.locationImages.length > 0) {
        setUnsplashImage(trip.locationImages[0]);
      } else {
        // Fallback to Google Places API
        fetchGooglePlaceImage();
        
        // Try to fetch Unsplash image as a backup
        if (trip.userSelection?.location) {
          fetchUnsplashImage(trip.userSelection.location);
        }
      }
    }
  }, [trip]);

  const fetchGooglePlaceImage = async () => {
    try {
      const data = {
        textQuery: trip?.userSelection?.location
      }
      const result = await GetPlaceDetails(data).then(resp => {
        const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
        setPhotoUrl(PhotoUrl);
      });
    } catch (error) {
      console.error("Error fetching Google Place image:", error);
    }
  }

  const fetchUnsplashImage = async (location) => {
    try {
      // Extract the main part of the location (before the first comma)
      const mainLocation = location.split(',')[0].trim();
      const result = await searchUnsplashImages(mainLocation, 1);
      
      if (result?.response?.results?.length > 0) {
        const photo = result.response.results[0];
        setUnsplashImage({
          id: photo.id,
          url: photo.urls.regular,
          small: photo.urls.small,
          alt: photo.alt_description || location,
          user: {
            name: photo.user.name,
            link: photo.user.links.html
          }
        });
      }
    } catch (error) {
      console.error("Error fetching Unsplash image:", error);
    }
  }

  const getImageUrl = () => {
    if (unsplashImage) {
      return unsplashImage.small || unsplashImage.url;
    } else if (photoUrl) {
      return photoUrl;
    } else {
      return '/road-trip-vacation.jpg';
    }
  }

  return (
   <Link to={'/view-trip/'+trip?.id}>
    <div className='hover:scale-105 transition-all hover:shadow-sm'>
      <div 
        className="relative"
        onMouseEnter={() => setShowAttribution(true)}
        onMouseLeave={() => setShowAttribution(false)}
      >
        <img 
          src={getImageUrl()} 
          className='rounded-xl h-[200px] w-full object-cover'
          alt={trip?.userSelection?.location || "Trip destination"}
        />
        
        {/* Unsplash attribution - only visible on hover */}
        {unsplashImage && showAttribution && (
          <div className="absolute bottom-0 right-0 bg-black bg-opacity-40 text-white text-[8px] p-1 rounded-tl-md">
            📷: <a href={unsplashImage.user.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{unsplashImage.user.name}</a>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h2 className='font-medium text-lg'>{trip?.userSelection?.location}</h2>
        <h2 className="text-sm text-gray-600">{trip?.userSelection?.totalDays} Days trip with {trip?.userSelection?.budget}</h2>
      </div>
    </div>
   </Link>
  )
}

export default UserTripCard
