import React from 'react'
import PlaceCardItem from './PlaceCardItem';

function TripPlace({trip}) {
  // Helper function to format day display text
  const formatDayText = (day, item, index) => {
    if (!day) return '';
    
    // Check if the day value is already a string containing "Day"
    if (typeof day === 'string' && day.toLowerCase().includes('day')) {
      return day; // Return it as is
    }
    
    // Extract first place name to create a description of the day
    let dayDescription = '';
    if (item?.plan && item.plan.length > 0) {
      // Use the first place's name to create a description for the day
      const firstPlace = item.plan[0];
      if (firstPlace.placeName) {
        // If we can extract a short description from place details, use that
        const shortDesc = firstPlace.placeDetails ? 
          firstPlace.placeDetails.split('.')[0] : 
          `Exploring ${firstPlace.placeName}`;
        
        // Limit to a reasonable length
        dayDescription = `: ${shortDesc.slice(0, 50)}${shortDesc.length > 50 ? '...' : ''}`;
      }
    }
    
    // Create formatted day title with description
    return `Day ${day}${dayDescription}`;
  };

  // Ensure that itinerary is an array before trying to map it
  const getItinerary = () => {
    if (!trip?.tripData?.itinerary) {
      return [];
    }
    
    // If itinerary is already an array, return it
    if (Array.isArray(trip.tripData.itinerary)) {
      return trip.tripData.itinerary;
    }
    
    // If itinerary is an object with day keys, convert to array
    if (typeof trip.tripData.itinerary === 'object') {
      try {
        // Try to convert from object format to array format
        const itineraryArray = [];
        Object.keys(trip.tripData.itinerary).forEach(key => {
          if (key.toLowerCase().includes('day')) {
            const dayNumber = key.replace(/\D/g, '');
            const dayData = trip.tripData.itinerary[key];
            
            // Handle different possible formats
            if (Array.isArray(dayData)) {
              // If day data is an array of places
              itineraryArray.push({
                day: dayNumber,
                plan: dayData.map(place => ({
                  placeName: place.name || place.placeName,
                  placeDetails: place.description || place.placeDetails,
                  placeImageUrl: place.imageUrl || place.placeImageUrl,
                  ...place
                }))
              });
            } else if (typeof dayData === 'object') {
              // If day data is an object with details
              itineraryArray.push({
                day: dayNumber,
                plan: [{
                  placeName: dayData.name || dayData.placeName,
                  placeDetails: dayData.description || dayData.placeDetails,
                  placeImageUrl: dayData.imageUrl || dayData.placeImageUrl,
                  ...dayData
                }]
              });
            }
          }
        });
        
        return itineraryArray;
      } catch (error) {
        console.error("Error parsing itinerary:", error);
        return [];
      }
    }
    
    return [];
  };

  const itinerary = getItinerary();

  // If no valid itinerary data, show a message
  if (itinerary.length === 0) {
    return (
      <div className='my-4'>
        <h2 className='font-bold text-xl'>Places to Visit</h2>
        <p className='text-gray-500 mt-2'>No places to visit information available for this trip.</p>
      </div>
    );
  }

  return (
    <div className='my-4'>
      <h2 className='font-bold text-xl'>Places to Visit</h2>
      <div>
        {itinerary.map((item, i) => (
          <div key={i}>
            <h2 className='font-medium text-l'>{formatDayText(item?.day, item, i)}</h2>
            <div className='grid md:grid-cols-2 gap-4'>
              {Array.isArray(item.plan) && item.plan.map((place, index) => (
                <PlaceCardItem key={index} place={place}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripPlace
