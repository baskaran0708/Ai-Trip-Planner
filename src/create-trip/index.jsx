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
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "@/service/firebaseConfig"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom"
import { searchUnsplashImages } from "@/service/GlobalApi"

function CreateTrip() {
  const [place,setPlace]=useState();
  const [formData,setFromData]=useState([]);
  const [openDialog,setOpenDialog]=useState(false);
  const [loading,setLoading]=useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationImages, setLocationImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const navigate=useNavigate();
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

  const login=useGoogleLogin({
    onSuccess:(codeResp)=>GetUserProfile(codeResp),
    onError:(error)=>console.log(error)
  })

  const OnGenerateTrip = async()=>{
    const user = localStorage.getItem('user')
    if(!user){
      setOpenDialog(true)
      return ;
    }
    if(formData?.totalDays>5 || !formData?.location || !formData?.budget || !formData?.traveler){
      toast("Please fill all details!")
      return ;
    }
    toast("Form generated.");
    setLoading(true);
    const FINAL_PROMPT=AI_PROMPT
    .replace('{location}',formData?.location)
    .replace('{totalDays}',formData?.totalDays)
    .replace('{traveler}',formData?.traveler)
    .replace('{budget}',formData?.budget)

    const result=await chatSession.sendMessage(FINAL_PROMPT);
    // console.log("--",result?.response?.text());
    setLoading(false);
    SaveAiTrip(result?.response?.text());
  } 

  const SaveAiTrip=async(TripData) => {
    setLoading(true);
    const user=JSON.parse(localStorage.getItem("user"));
    const docId=Date.now().toString();
    await setDoc(doc(db, "AiTrips", docId), {
      userSelection:formData,
      tripData:JSON.parse(TripData),
      userEmail:user?.email,
      id:docId,
      locationImages: locationImages
    });
    setLoading(false);
    navigate('/view-trip/'+docId);
  }

  const GetUserProfile=(tokenInfo)=>{
    console.log("Token info:", tokenInfo);
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,{
      headers: {
       Authorization: `Bearer ${tokenInfo?.access_token}`,
       Accept:'application/json'
      }
    }).then((resp) => {
      console.log("Google user data:", resp.data);
      const userData = resp.data;
      
      // Ensure the 'picture' field is properly set
      if (!userData.picture && userData.image) {
        userData.picture = userData.image;
      }
      
      localStorage.setItem('user',JSON.stringify(userData));
      setOpenDialog(false);
      OnGenerateTrip();
    }).catch(err => {
      console.error("Error fetching user profile:", err);
      toast.error("Failed to get user profile. Please try again.");
    });
  }

  // Function to fetch location suggestions from LocationIQ
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

  // Function to fetch images from Unsplash when a location is selected
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
    
    // Extract the primary location name (city or country)
    const primaryLocation = location.address?.city || 
                           location.address?.state || 
                           location.address?.country ||
                           locationName.split(',')[0].trim();
    
    handleInputChange('location', locationName);
    setShowSuggestions(false);
    
    // Fetch images for the selected location
    fetchLocationImages(primaryLocation);
  };

  // Display the first image as a preview after location selection
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
          {/* Show image preview when a location is selected */}
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

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/trip-logo-image.png" alt="Logo" className="h-16 w-auto mx-auto"/>
              <h2 className="font-bold text-lg mt-6">Sign In with Google</h2>
              <p>Sign In to the App with Google authentication securely</p>
              <Button 
              onClick={login} className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7"/>
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CreateTrip
