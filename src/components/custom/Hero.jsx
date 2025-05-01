import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function Hero() {
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
    </div>
  )
}

export default Hero
