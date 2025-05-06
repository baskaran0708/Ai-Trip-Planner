import React, { useState, useEffect } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, orderBy, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

// Helper function to format dates from various formats
const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown';
  
  try {
    // If it's a Firestore timestamp with toDate method
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // If it's an ISO string
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    
    // If it's a date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    // Fallback
    return 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
    return 'Invalid date';
  }
};

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMap, setUserMap] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get trips collection
        const q = query(collection(db, 'AiTrips'));
        const querySnapshot = await getDocs(q);
        
        const tripData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        
        setTrips(tripData);
        
        // Fetch user details for each trip
        const userIds = [...new Set(tripData.map(trip => trip.userId).filter(Boolean))];
        const userDetails = {};
        
        for (const userId of userIds) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              userDetails[userId] = userDoc.data();
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        
        setUserMap(userDetails);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError('Failed to load trips. Please check the console for details.');
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, []);

  const deleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'AiTrips', tripId));
      
      // Update local state
      setTrips(trips.filter(trip => trip.id !== tripId));
      
      toast.success('Trip deleted successfully');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (!searchTerm) return true;
    
    const location = (trip.userSelection?.location || '').toLowerCase();
    const userName = (trip.userName || userMap[trip.userId]?.displayName || '').toLowerCase();
    const email = (trip.userEmail || userMap[trip.userId]?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return location.includes(search) || userName.includes(search) || email.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h2 className="text-lg font-medium text-red-800">Error</h2>
        <p className="text-red-600">{error}</p>
        <p className="mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Trip Management</h1>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          className="pl-10"
          placeholder="Search by destination or user..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredTrips.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? 'No trips match your search' : 'No trips found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.userSelection?.location || 'Unnamed Trip'}
                  </TableCell>
                  <TableCell>
                    {trip.userName || userMap[trip.userId]?.displayName || trip.userEmail || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {trip.userSelection?.totalDays || 'N/A'} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(trip.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/view-trip/${trip.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTrip(trip.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TripManagement; 