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

  return (
    <div className='my-4'>
      <h2 className='font-bold text-xl'>Places to Visit</h2>
      <div>
        {trip?.tripData?.itinerary?.map((item,i)=>(
            <div key={i}>
                <h2 className='font-medium text-l'>{formatDayText(item?.day, item, i)}</h2>
                <div className='grid md:grid-cols-2 gap-4'>
                        {item.plan?.map((place,index)=>(
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
