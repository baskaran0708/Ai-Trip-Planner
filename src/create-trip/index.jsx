import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { AI_PROMPT, SelectBudgetOptions,SelectTravelList } from "@/constants/options"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { chatSession } from "@/service/AIModal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "@/service/firebaseConfig"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom"
import { searchUnsplashImages } from "@/service/GlobalApi"
import { useAuth } from "@/lib/AuthContext";
import axios from "axios";

// Add this function at the top level, outside the component
const logObject = (obj, label) => {
  try {
    console.log(`${label}:`, JSON.stringify(obj));
  } catch (error) {
    console.log(`${label} (circular references):`, obj);
  }
};

function CreateTrip() {
  const location = useLocation();
  const preselectedDestination = location.state?.preselectedDestination;
  const preselectedDays = location.state?.preselectedDays;
  
  const [place,setPlace]=useState();
  const [formData,setFromData]=useState({
    totalDays: preselectedDays || "",
    location: preselectedDestination || "",
    traveler: "",
    budget: ""
  });
  const [openDialog,setOpenDialog]=useState(false);
  const [loading,setLoading]=useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationImages, setLocationImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const navigate=useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();
  const locationIqKey = "pk.e438e1b3aa59a3139211392a75fbc40d";

  const handleInputChange=(name,value)=>{
    setFromData({
      ...formData,
      [name]:value
    })
  }
  
  useEffect(()=>{ 
    console.log(formData)
  },[formData])

  // Modified to handle preselected destination on component mount
  useEffect(() => {
    if (preselectedDestination) {
      setSearchTerm(preselectedDestination);
      fetchLocationImages(preselectedDestination);
    }
  }, [preselectedDestination]);

  const OnGenerateTrip = async() => {
    console.log("Generate Trip button clicked");
    console.log("Current user:", currentUser?.email);
    logObject(formData, "Form data");
    
    if(!currentUser){
      try {
        console.log("User not signed in, prompting sign in");
        await signInWithGoogle();
        toast.info("Please sign in with Google to generate a trip. Click 'Generate Trip' again after signing in.");
      } catch (error) {
        console.error("Sign in failed:", error);
        toast.error("Sign in failed. Please try again.");
      }
      return;
    }
    
    if(!formData?.location || !formData?.totalDays || !formData?.budget || !formData?.traveler) {
      console.log("Form validation failed - missing fields");
      toast.error("Please fill all required fields!");
      return;
    }
    
    if(formData.totalDays > 5) {
      console.log("Trip days exceeds maximum");
      toast.warning("Trip days should not exceed 5 days");
      return;
    }
    
    toast("Generating Trip...");
    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location)
      .replace('{totalDays}', formData?.totalDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget);
    
    console.log("Final AI prompt:", FINAL_PROMPT);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log("AI Response received");
      const responseText = result?.response?.text();
      console.log("AI Response text:", responseText);
      SaveAiTrip(responseText);
    } catch (error) {
      console.error("Error generating trip with AI:", error);
      toast.error("Failed to generate trip itinerary. Please try again.");
      setLoading(false);
    }
  }

  const SaveAiTrip = async(TripData) => {
    console.log("SaveAiTrip called");
    
    if (!currentUser) {
      console.error("No user found in SaveAiTrip");
      toast.error("User not signed in. Cannot save trip.");
      setLoading(false);
      return;
    }
    
    console.log("Current user in SaveAiTrip:", currentUser.email, currentUser.uid);
    setLoading(true);
    const docId = Date.now().toString();
    console.log("Generated document ID:", docId);
    
    try {
      console.log("Parsing trip data...");
      let parsedTripData;
      try {
        parsedTripData = JSON.parse(TripData);
        
        // Validate and normalize the trip data structure
        if (!parsedTripData.itinerary) {
          console.warn("No itinerary found in trip data");
          // Search for itinerary-like data in the response
          const keys = Object.keys(parsedTripData);
          const itineraryKey = keys.find(key => key.toLowerCase().includes('day') || key.toLowerCase().includes('itinerary'));
          
          if (itineraryKey) {
            parsedTripData.itinerary = parsedTripData[itineraryKey];
          } else {
            // Create a basic itinerary structure
            parsedTripData.itinerary = [];
          }
        }
        
        // Ensure itinerary is in the correct format (array of days)
        if (!Array.isArray(parsedTripData.itinerary)) {
          const originalItinerary = parsedTripData.itinerary;
          // If itinerary is an object, convert to array
          if (typeof originalItinerary === 'object') {
            parsedTripData.itinerary = Object.keys(originalItinerary)
              .filter(key => key.toLowerCase().includes('day'))
              .map(key => {
                const dayNum = key.replace(/\D/g, '') || key;
                const dayData = originalItinerary[key];
                
                // Normalize the day data structure
                return {
                  day: dayNum,
                  plan: Array.isArray(dayData) ? dayData : [dayData]
                };
              });
          } else {
            // Default to empty array if unexpected format
            parsedTripData.itinerary = [];
          }
        }
        
        // Similarly validate hotel options
        if (!parsedTripData.hotelOptions) {
          console.warn("No hotel options found in trip data");
          // Search for hotel-like data in the response
          const keys = Object.keys(parsedTripData);
          const hotelKey = keys.find(key => 
            key.toLowerCase().includes('hotel') || 
            key.toLowerCase().includes('accommodation')
          );
          
          if (hotelKey) {
            parsedTripData.hotelOptions = parsedTripData[hotelKey];
          } else {
            // Create a basic hotel options structure
            parsedTripData.hotelOptions = [];
          }
        }
        
        // Ensure hotelOptions is in the correct format (array of hotels)
        if (!Array.isArray(parsedTripData.hotelOptions)) {
          const originalHotels = parsedTripData.hotelOptions;
          // If hotelOptions is an object, convert to array
          if (typeof originalHotels === 'object') {
            parsedTripData.hotelOptions = Object.values(originalHotels);
          } else {
            // Default to empty array if unexpected format
            parsedTripData.hotelOptions = [];
          }
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.log("Raw trip data that failed to parse:", TripData);
        toast.error("Error parsing AI response. Please try again.");
        setLoading(false);
        return;
      }
      
      console.log("Creating trip document...");
      const tripDoc = {
        userSelection: formData,
        tripData: parsedTripData,
        userEmail: currentUser?.email,
        userId: currentUser?.uid,
        id: docId,
        locationImages: locationImages,
        createdAt: new Date().toISOString(),
        userName: currentUser?.displayName || 'Anonymous'
      };
      
      logObject(tripDoc, "Trip document to save");
      
      // Save to Firestore
      console.log("Writing to Firestore...");
      await setDoc(doc(db, "AiTrips", docId), tripDoc);
      
      console.log("Trip saved successfully with ID:", docId);
      toast.success("Trip saved successfully!");
      navigate('/view-trip/'+docId);
    } catch (error) {
      console.error("Error saving trip:", error);
      
      if (error instanceof SyntaxError) {
        toast.error("Error reading AI response. Please try generating again.");
        console.error("Invalid JSON data from AI:", TripData);
      } else {
        toast.error("Failed to save trip to database.");
      }
    } finally {
      setLoading(false);
    }
  }

  const searchLocations = async (query) => {
    setSearchTerm(query);
    
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php`, {
        params: {
          key: locationIqKey,
          q: query,
          limit: 5,
          format: 'json'
        }
      });
      setLocationSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      toast.error("Error fetching location suggestions. Please try again.");
      setLocationSuggestions([]);
    }
  };

  const fetchLocationImages = async (locationName) => {
    try {
      setImagesLoading(true);
      const result = await searchUnsplashImages(locationName, 5);
      if (result && result.response && result.response.results) {
        const images = result.response.results.map(photo => ({
          id: photo.id,
          url: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
          alt: photo.alt_description || locationName,
          user: {
            name: photo.user.name,
            link: photo.user.links.html
          }
        }));
        setLocationImages(images);
      }
    } catch (error) {
      console.error("Error fetching Unsplash images:", error);
      toast.error("Failed to fetch location images");
    } finally {
      setImagesLoading(false);
    }
  };

  const selectLocation = (location) => {
    const locationName = location.display_name;
    setSearchTerm(locationName);
    setPlace(location);
    
    const primaryLocation = location.address?.city || 
                           location.address?.state || 
                           location.address?.country ||
                           locationName.split(',')[0].trim();
    
    handleInputChange('location', locationName);
    setShowSuggestions(false);
    
    fetchLocationImages(primaryLocation);
  };

  const LocationImagePreview = () => {
    if (imagesLoading) {
      return <div className="mt-2 text-sm text-gray-500">Loading location images...</div>;
    }
    
    if (locationImages.length > 0) {
      return (
        <div className="mt-3">
          <div className="relative rounded-lg overflow-hidden h-40">
            <img 
              src={locationImages[0].url} 
              alt={locationImages[0].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
              Photo by <a href={locationImages[0].user.link} target="_blank" rel="noopener noreferrer" className="underline">{locationImages[0].user.name}</a> on Unsplash
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="px-5 mt-12 sm:px-10 md:px-32 lg:px-56 xl:px-72">
     <div>
     <h2 className="font-bold text-3xl ">Tell us your travel preferences 🌍✈️🌴</h2>
     <p className="mt-3 text-gray-600 text-xl">Just provide some basic information,and our trip planner will generate a customized itinerary based on your preferences.</p>
     </div>

      <div className="mt-20 flex flex-col gap-10 ">
       <div className="mb-5">
        <label className="text-xl mb-3 font-medium">What is destination of choice?</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter a location..."
            value={searchTerm}
            onChange={(e) => searchLocations(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {showSuggestions && locationSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
              {locationSuggestions.map((location, index) => (
                <li 
                  key={index} 
                  className="p-2 cursor-pointer hover:bg-gray-100 border-b"
                  onClick={() => selectLocation(location)}
                >
                  {location.display_name}
                </li>
              ))}
            </ul>
          )}
          <LocationImagePreview />
        </div>
       </div>

        <div className="mb-5">
          <label className="text-xl font-medium">How many days are you planning your trip?</label>
          <Input placeholder={'ex.3'} type='number' min="1" 
          onChange={(v)=>handleInputChange('totalDays',v.target.value)}/>
        </div>

        <div>
            <label className="text-xl my-3 font-medium">What is Your Budget?</label>
            <p>The budget is exclusively allocated for activities and dining purposes. </p>
            <div className="grid grid-cols-3 gap-5 mt-5 mb-5">
              {SelectBudgetOptions.map((item,index)=>(
                <div key={index} 
                onClick={()=>handleInputChange('budget',item.title)}
                className={`cursor-pointer p-4 border rounded-lg hover:shadow-lg
                ${formData?.budget==item.title&&'shadow-lg border-cyan-500'}
                `}>
                  <h2 className="text-3xl">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <h2 className="text-sm text-gray-500">{item.desc}</h2>
                </div>
              ))}
            </div>

            <label className="text-xl font-medium my-3"> Who do you plan on traveling with on your next adventure?</label>
            <div className="grid grid-cols-3 gap-5 mt-5">
              {SelectTravelList.map(( item,index)=>(
                <div key={index}
                onClick={()=>handleInputChange('traveler',item.people)}
                className={`cursor-pointer p-4 border rounded-lg hover:shadow-lg
                  ${formData?.traveler==item.people&&'shadow-lg border-cyan-500'}
                  `}>
                  <h2 className="text-3xl">{item.icon}</h2> 
                  <h2 className="text-lg font-bold">{item.title}</h2> 
                  <h2 className="text-sm text-gray-500">{item.desc}</h2> 
                </div>
              ))}
            </div>
        </div>
      </div>
      <div className="my-10 flex justify-end ">
        <Button onClick={OnGenerateTrip} disabled={loading} >
          {loading ? 
          <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
           : 'Generate Trip' }
          </Button>
      </div>

    </div>
  )
}

export default CreateTrip
