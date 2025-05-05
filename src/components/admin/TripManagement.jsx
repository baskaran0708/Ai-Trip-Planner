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

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'AiTrips'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const tripData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
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
    const destination = (trip.destination || '').toLowerCase();
    const userName = userMap[trip.userId]?.displayName?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return destination.includes(search) || userName.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                    {trip.destination || 'Unnamed Trip'}
                  </TableCell>
                  <TableCell>
                    {userMap[trip.userId]?.displayName || trip.userId || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {trip.duration || 'N/A'} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trip.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
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