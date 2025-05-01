import { Button } from '@/components/ui/button';
import { GetPlaceDetails, PHOTO_REF_URL, searchUnsplashImages } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';

function PlaceCardItem({ place }) {
    const [photoUrl, setPhotoUrl] = useState();
    const [unsplashImage, setUnsplashImage] = useState(null);
    const [showAttribution, setShowAttribution] = useState(false);

    useEffect(() => {
        if (place) {
            GetPlaceImg();
            fetchUnsplashImage(place.placeName);
        }
    }, [place])

    const GetPlaceImg = async () => {
        try {
            const data = {
                textQuery: place.placeName
            }
            const result = await GetPlaceDetails(data).then(resp => {
                const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
                setPhotoUrl(PhotoUrl);
            });
        } catch (error) {
            console.error("Error fetching Google Place image:", error);
        }
    }

    const fetchUnsplashImage = async (placeName) => {
        try {
            // Try to fetch an image from Unsplash as a backup
            const result = await searchUnsplashImages(placeName, 1);
            
            if (result?.response?.results?.length > 0) {
                const photo = result.response.results[0];
                setUnsplashImage({
                    id: photo.id,
                    url: photo.urls.regular,
                    small: photo.urls.small,
                    thumb: photo.urls.thumb,
                    alt: photo.alt_description || placeName,
                    user: {
                        name: photo.user.name,
                        link: photo.user.links.html
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching Unsplash image for place:", error);
        }
    }

    const getImageUrl = () => {
        if (unsplashImage) {
            return unsplashImage.thumb || unsplashImage.small || unsplashImage.url;
        } else if (photoUrl) {
            return photoUrl;
        } else {
            return '/road-trip-vacation.jpg';
        }
    }

    return (
        <div>
            <Link to={'https://www.google.com/maps/search/?api=1&query=' + place?.placeName + "," + place?.geoCoordinates} target='_blank'>
                <div className='my-4 bg-gray-50 p-2 gap-2 border rounded-lg flex flex-cols-2 hover:scale-105 transition-all hover:shadow-md cursor-pointer '>
                    <div 
                        className='py-2 mx-3 relative'
                        onMouseEnter={() => setShowAttribution(true)}
                        onMouseLeave={() => setShowAttribution(false)}
                    >
                        <img 
                            src={getImageUrl()} 
                            className='w-[140px] h-[140px] rounded-xl object-cover'
                            alt={place.placeName || "Place image"} 
                        />
                        {unsplashImage && showAttribution && (
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-40 text-white text-[7px] p-1 rounded-tl-md">
                                📷: <a href={unsplashImage.user.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{unsplashImage.user.name}</a>
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className='font-medium text-sm text-orange-600'>{place.time}</h2>
                        <h2 className='font-bold'>{place.placeName}</h2>
                        <p className='text-sm text-gray-500'>{place.placeDetails}</p>
                        <h2 className='text-blue-700 text-sm'>{place.ticketPricing}</h2>
                        <h2 className='text-sm text-yellow-500'>⭐{place.rating}</h2>
                    </div>
                    <div className='mt-36'>
                        <Button><FaLocationDot /></Button>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default PlaceCardItem
