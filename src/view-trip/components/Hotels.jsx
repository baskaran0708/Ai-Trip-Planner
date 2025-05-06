import React from 'react'
import HotelCardItem from './HotelCardItem'

function Hotels({trip}) {
  // Ensure that hotelOptions is an array before trying to map it
  const getHotelOptions = () => {
    if (!trip?.tripData?.hotelOptions) {
      return [];
    }
    
    // If hotelOptions is already an array, return it
    if (Array.isArray(trip.tripData.hotelOptions)) {
      return trip.tripData.hotelOptions;
    }
    
    // If hotelOptions is an object, convert to array
    if (typeof trip.tripData.hotelOptions === 'object') {
      try {
        return Object.values(trip.tripData.hotelOptions).map(hotel => {
          // Normalize hotel properties to ensure consistent structure
          return {
            hotelName: hotel.name || hotel.hotelName,
            hotelAddress: hotel.address || hotel.hotelAddress,
            price: hotel.price,
            hotelImageUrl: hotel.imageUrl || hotel.hotelImageUrl,
            coordinates: hotel.coordinates || hotel.geo,
            rating: hotel.rating,
            description: hotel.description,
            ...hotel
          };
        });
      } catch (error) {
        console.error("Error parsing hotel options:", error);
        return [];
      }
    }
    
    return [];
  };

  const hotelOptions = getHotelOptions();

  // If no valid hotel data, show a message
  if (hotelOptions.length === 0) {
    return (
      <div>
        <h2 className='font-bold text-xl my-7'>Hotel Recommendation</h2>
        <p className='text-gray-500'>No hotel recommendations available for this trip.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className='font-bold text-xl my-7'>Hotel Recommendation</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {hotelOptions.map((item, index) => (
          <HotelCardItem key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

export default Hotels
