import { GetPlaceDetails, PHOTO_REF_URL, searchUnsplashImages } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function HotelCardItem({item}) {
    const [photoUrl, setPhotoUrl] = useState();
    const [unsplashImage, setUnsplashImage] = useState(null);
    const [showAttribution, setShowAttribution] = useState(false);

    useEffect(() => {
      if (item) {
        GetPlaceImg();
        fetchUnsplashImage(item?.hotelName);
      }
    }, [item])
  
    const GetPlaceImg = async () => { 
      try {
        const data = {
          textQuery: item?.hotelName
        }
        const result = await GetPlaceDetails(data).then(resp => {
          const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
          setPhotoUrl(PhotoUrl);
        });
      } catch (error) {
        console.error("Error fetching Google Place image for hotel:", error);
      }
    }

    const fetchUnsplashImage = async (hotelName) => {
        try {
            // Try to find a good hotel image on Unsplash
            const searchTerm = `${hotelName} hotel`;
            const result = await searchUnsplashImages(searchTerm, 1);
            
            if (result?.response?.results?.length > 0) {
                const photo = result.response.results[0];
                setUnsplashImage({
                    id: photo.id,
                    url: photo.urls.regular,
                    small: photo.urls.small,
                    alt: photo.alt_description || hotelName,
                    user: {
                        name: photo.user.name,
                        link: photo.user.links.html
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching Unsplash image for hotel:", error);
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
      <div>
        <Link to={'https://www.google.com/maps/search/?api=1&query='+item?.hotelName+ "," +item?.hotelAddress} target='_blank'>
          <div className='hover:scale-105 transition-all cursor-pointer'>
            <div 
              className="relative"
              onMouseEnter={() => setShowAttribution(true)}
              onMouseLeave={() => setShowAttribution(false)}
            >
              <img 
                src={getImageUrl()}  
                className='rounded-xl h-[180px] w-full object-cover'
                alt={item?.hotelName || "Hotel image"}
              />
              {unsplashImage && showAttribution && (
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-40 text-white text-[8px] p-1 rounded-tl-md">
                  📷: <a href={unsplashImage.user.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{unsplashImage.user.name}</a>
                </div>
              )}
            </div>
            <div className='my-3 py-2'>
              <h2 className='font-medium'>{item?.hotelName}</h2>
              <h2 className='text-xs text-gray-500'>📍{item?.hotelAddress} </h2>
              <h2 className='text-sm'>💰{item?.price}</h2>
              <h2 className='text-sm'>⭐{item?.rating} </h2>
            </div>
          </div>
        </Link>    
      </div>
    )
}

export default HotelCardItem
