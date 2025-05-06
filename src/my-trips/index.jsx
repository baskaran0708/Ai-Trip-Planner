import { db } from '@/service/firebaseConfig';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, getDoc, doc } from "firebase/firestore";
import UserTripCard from './components/UserTripCard';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info, Wrench } from 'lucide-react';
import { runFirestoreTest } from '@/service/firestoreTest';

function MyTrips() {
    const navigate = useNavigate();
    const [userTrips, setUserTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [testLoading, setTestLoading] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Check Firestore connection first
            checkFirestoreConnection()
                .then(() => getUserTrips())
                .catch(err => {
                    setError("Database connection issue: " + err.message);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    // Function to check if Firestore is accessible
    const checkFirestoreConnection = async () => {
        try {
            // Try to access Firestore with a simple query
            const testQuery = query(collection(db, 'AiTrips'), limit(1));
            await getDocs(testQuery);
            console.log("Firestore connection successful");
            return true;
        } catch (error) {
            console.error("Firestore connection error:", error);
            toast.error("Cannot connect to the database. Please check your internet connection.");
            throw error;
        }
    };

    const getUserTrips = async () => {
        if (!currentUser) {
            toast.error("Please sign in to view your trips");
            navigate('/');
            return;
        }

        setLoading(true);
        setUserTrips([]); // Reset trips array before fetching
        
        try {
            console.log("Fetching trips for user ID:", currentUser.uid);
            
            // Simple query without orderBy to avoid index issues
            const q = query(
                collection(db, 'AiTrips'),
                where('userId', '==', currentUser.uid)
            );
            
            const querySnapshot = await getDocs(q);
            const trips = [];
            
            console.log("Query returned", querySnapshot.size, "trips");
            
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
                trips.push(doc.data());
            });
            
            // Sort trips by createdAt on the client side instead
            const sortedTrips = trips.sort((a, b) => {
                // If createdAt exists, use it to sort
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                // Otherwise sort by id (which is a timestamp)
                return b.id - a.id;
            });
            
            setUserTrips(sortedTrips);
            setError(null);
            
            if (trips.length > 0) {
                toast.success(`Found ${trips.length} trip${trips.length > 1 ? 's' : ''}`);
            } else {
                toast("No trips found. Create your first trip!");
            }
        } catch (error) {
            console.error("Error fetching trips:", error);
            setError("Failed to fetch trips: " + error.message);
            toast.error("Failed to load your trips. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    // Run diagnostic test on Firestore
    const runDiagnostics = async () => {
        if (!currentUser) {
            toast.error("Please sign in to run diagnostics");
            return;
        }
        
        setTestLoading(true);
        setTestResults(null);
        
        try {
            toast.info("Running diagnostics...");
            const results = await runFirestoreTest(
                currentUser.uid, 
                currentUser.email, 
                currentUser.displayName
            );
            setTestResults(results);
            
            if (results.getUserTrips) {
                toast.success("Diagnostics successful! Your Firestore connection is working.");
                
                // Refresh trips list after successful test
                getUserTrips();
            } else {
                toast.error("Diagnostics completed with errors. Check console for details.");
            }
        } catch (error) {
            console.error("Error running diagnostics:", error);
            toast.error("Diagnostics failed: " + error.message);
        } finally {
            setTestLoading(false);
        }
    };
   
    return (
        <div className='px-5 mt-12 sm:px-10 md:px-32 lg:px-56 xl:px-72"'>
            <div className="flex justify-between items-center mb-10">
                <h2 className='font-bold text-3xl'>My Trips</h2>
                
                {currentUser && (
                    <div className="flex gap-2">
                        <Button 
                            onClick={runDiagnostics} 
                            disabled={testLoading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Wrench className={`h-4 w-4 ${testLoading ? 'animate-spin' : ''}`} />
                            Diagnostics
                        </Button>
                        <Button 
                            onClick={getUserTrips} 
                            disabled={loading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                )}
            </div>
            
            {testResults && (
                <div className={`p-4 mb-6 border rounded-md ${
                    Object.values(testResults).every(val => val) 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                }`}>
                    <h3 className="font-medium mb-2">Firestore Diagnostics Results:</h3>
                    <ul className="text-sm">
                        <li className={testResults.connection ? 'text-green-600' : 'text-red-600'}>
                            Connection: {testResults.connection ? '✅ Success' : '❌ Failed'}
                        </li>
                        <li className={testResults.create ? 'text-green-600' : 'text-red-600'}>
                            Create Trip: {testResults.create ? '✅ Success' : '❌ Failed'}
                        </li>
                        <li className={testResults.get ? 'text-green-600' : 'text-red-600'}>
                            Get Trip: {testResults.get ? '✅ Success' : '❌ Failed'}
                        </li>
                        <li className={testResults.getUserTrips ? 'text-green-600' : 'text-red-600'}>
                            Get User Trips: {testResults.getUserTrips ? '✅ Success' : '❌ Failed'}
                        </li>
                        <li className={testResults.delete ? 'text-green-600' : 'text-red-600'}>
                            Delete Trip: {testResults.delete ? '✅ Success' : '❌ Failed'}
                        </li>
                    </ul>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start">
                    <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                        <p className="text-sm text-red-700 mt-1">User ID: {currentUser?.uid || 'Not signed in'}</p>
                    </div>
                </div>
            )}
            
            {!currentUser ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">Please sign in to view your trips</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-primary text-white rounded-md"
                    >
                        Go to Home
                    </button>
                </div>
            ) : loading ? (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-5 my-3'>
                    {[1, 2, 3, 4, 5, 6].map((item, index) => (
                        <div key={index} className='h-[200px] w-full bg-slate-200 animate-pulse rounded-xl'></div>
                    ))}
                </div>
            ) : (
                <>
                    {userTrips.length > 0 ? (
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 my-3'>
                            {userTrips.map((trip, index) => (
                                <UserTripCard trip={trip} key={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">You haven't created any trips yet</p>
                            <button 
                                onClick={() => navigate('/create-trip')}
                                className="px-4 py-2 bg-primary text-white rounded-md"
                            >
                                Create Your First Trip
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MyTrips
