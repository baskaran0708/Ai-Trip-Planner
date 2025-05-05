import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import TripPlace from '../components/TripPlace';
import Footer from '../components/Footer';
import DownloadButton from '@/components/custom/DownloadButton';
import ShareButton from '@/components/custom/ShareButton';

function ViewTrip() {
    const {tripId} = useParams();
    const [trip, setTrip] = useState();
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);
    
    const GetTripData = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, "AiTrips", tripId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                setTrip(docSnap.data());
            } else {
                console.log("No such document!");
                toast.error('Trip not found!');
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
            toast.error('Error loading trip data');
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);
    
    // Get Trip Info Data from Firebase
    return (
        <div className='p-6 md:p-12 md:px-25 lg:px-44 xl:px:56'>
            {/* Action buttons */}
            <div className="flex justify-end gap-2 mb-4">
                <ShareButton tripId={tripId} tripData={trip} />
                <DownloadButton trip={trip} printRef={printRef} />
            </div>
            
            {/* Main trip content to be printed/exported */}
            <div ref={printRef}>
                <InfoSection trip={trip} />
                <Hotels trip={trip} />
                <TripPlace trip={trip} />
                <Footer trip={trip} />
            </div>
        </div>
    );
}

export default ViewTrip;
