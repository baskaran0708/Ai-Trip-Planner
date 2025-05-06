import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState({});
  
  const popularDestinations = [
    {
      name: "Paris",
      image: "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 5
    },
    {
      name: "Tokyo",
      image: "https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 7
    },
    {
      name: "New York",
      image: "https://images.pexels.com/photos/2224861/pexels-photo-2224861.png?auto=compress&cs=tinysrgb&w=600",
      days: 4
    },
    {
      name: "Bali",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 6
    },
    {
      name: "Rome",
      image: "https://images.pexels.com/photos/1797158/pexels-photo-1797158.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 5
    },
    {
      name: "Santorini",
      image: "https://images.pexels.com/photos/1010641/pexels-photo-1010641.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 4
    },
    {
      name: "Bangkok",
      image: "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 5
    },
    {
      name: "Dubai",
      image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=600",
      days: 6
    }
  ];
  
  const popularHotels = [
    {
      name: "Burj Al Arab",
      location: "Dubai, UAE",
      image: "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "Marina Bay Sands",
      location: "Singapore",
      image: "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "The Plaza",
      location: "New York, USA",
      image: "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "Ritz Paris",
      location: "Paris, France",
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];
  
  const handleDestinationClick = (destination, days) => {
    navigate('/create-trip', { 
      state: { 
        preselectedDestination: destination,
        preselectedDays: days
      } 
    });
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  return (
    <div className="flex flex-col items-center mx-auto px-4 gap-9 py-10">
      <h1
      className="font-extrabold text-4xl md:text-5xl text-center mt-8">
        <span className='text-[#f56551]'>Discover Your Next Adventure with AI:</span> <br></br> Personalized Itineraries at Your Fingertips</h1>
        <p className='text-xl text-gray-500 text-center max-w-3xl'>Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.</p>
        <Link to={'/create-trip'}>
          <Button className="px-6 py-2 text-lg">Get Started, It's Free.</Button>
        </Link>
        <img src='/landing.png' className='max-w-full h-auto mt-8 md:mt-4' alt="AI Travel Planning" />
        
        {/* Popular Destinations Section */}
        <div className="w-full max-w-7xl mt-16 mb-8">
          <h2 className="text-3xl font-bold text-center mb-2">Popular Destinations</h2>
          <p className="text-center text-gray-500 mb-8">Explore these trending destinations for your next getaway</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={() => handleDestinationClick(destination.name, destination.days)}
              >
                <div className="relative h-48 bg-gray-200">
                  {!loadedImages[`dest-${index}`] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[`dest-${index}`] ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(`dest-${index}`)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/png?text=' + destination.name;
                      handleImageLoad(`dest-${index}`);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg">{destination.name}</h3>
                      <p className="text-sm">{destination.days} days recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Popular Hotels Section */}
        <div className="w-full max-w-7xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">Featured Hotels</h2>
          <p className="text-center text-gray-500 mb-8">Luxury accommodations for the perfect stay</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularHotels.map((hotel, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-gray-200">
                  {!loadedImages[`hotel-${index}`] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[`hotel-${index}`] ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(`hotel-${index}`)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/png?text=' + hotel.name;
                      handleImageLoad(`hotel-${index}`);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg">{hotel.name}</h3>
                      <p className="text-sm">{hotel.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default Hero
