import { GetPlaceDetails, PHOTO_REF_URL, searchUnsplashImages } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'

function InfoSection({trip}) {
  const [photoUrl, setPhotoUrl] = useState();
  const [unsplashImage, setUnsplashImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);

  useEffect(() => {
    if (trip) {
      // Check if we have Unsplash images in the trip data
      if (trip.locationImages && trip.locationImages.length > 0) {
        setUnsplashImage(trip.locationImages[0]);
      } else {
        // Fallback to Google Places API
        fetchGooglePlaceImage();
        
        // Try to fetch Unsplash image as a backup if no stored images
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
      setImageError(true);
    }
  }

  const fetchUnsplashImage = async (location) => {
    try {
      setImageLoading(true);
      // Extract the main part of the location (before the first comma)
      const mainLocation = location.split(',')[0].trim();
      const result = await searchUnsplashImages(mainLocation, 1);
      
      if (result?.response?.results?.length > 0) {
        const photo = result.response.results[0];
        setUnsplashImage({
          id: photo.id,
          url: photo.urls.regular,
          alt: photo.alt_description || location,
          user: {
            name: photo.user.name,
            link: photo.user.links.html
          }
        });
      }
    } catch (error) {
      console.error("Error fetching Unsplash image:", error);
    } finally {
      setImageLoading(false);
    }
  }

  const getImageUrl = () => {
    if (unsplashImage) {
      return unsplashImage.url;
    } else if (photoUrl) {
      return photoUrl;
    } else {
      return '/road-trip-vacation.jpg';
    }
  }

  return (
    <div>
      <div 
        className="relative" 
        onMouseEnter={() => setShowAttribution(true)}
        onMouseLeave={() => setShowAttribution(false)}
      >
        <img 
          src={getImageUrl()} 
          className='h-[330px] w-full object-cover rounded-xl'
          alt={trip?.userSelection?.location || "Trip destination"}
        />
        
        {/* Unsplash attribution - only visible on hover */}
        {unsplashImage && showAttribution && (
          <div className="absolute bottom-0 right-0 bg-black bg-opacity-40 text-white text-[8px] p-1 rounded-tl-md transition-opacity">
            <a href={unsplashImage.user.link} target="_blank" rel="noopener noreferrer" className="hover:underline">📷: {unsplashImage.user.name}</a>
          </div>
        )}
      </div>
      
      <div className='flex justify-between items-center'>
        <div className='my-6 flex flex-col gap-2'>
          <h2 className='font-bold text-2xl'>{trip?.userSelection?.location}</h2>
          <div className='flex flex-wrap gap-6 mt-4'>
            <h2 className='bg-gray-200 font-medium text-gray-600 rounded-full p-1 px-4 md:text-md'>🗓️ {trip?.userSelection?.totalDays} Day</h2>
            <h2 className='bg-gray-200 font-medium text-gray-600 rounded-full p-1 px-4 md:text-md'>👩‍👧‍👦 Number of Traveler : {trip?.userSelection?.traveler} People</h2>
            <h2 className='bg-gray-200 font-medium text-gray-600 rounded-full p-1 px-4 md:text-md'>💵 {trip?.userSelection?.budget} Budget </h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSection
