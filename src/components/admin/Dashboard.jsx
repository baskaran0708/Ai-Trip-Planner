import React, { useState, useEffect } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer, doc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Map, Download, Activity } from 'lucide-react';

// Helper function to format dates from various formats
const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown date';
  
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalDownloads: 0,
    recentTrips: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get total users count
        const usersQuery = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersQuery);
        const totalUsers = usersSnapshot.data().count;
        
        // Get total trips count
        const tripsQuery = collection(db, 'AiTrips');
        const tripsSnapshot = await getCountFromServer(tripsQuery);
        const totalTrips = tripsSnapshot.data().count;
        
        // Get total downloads count with better error handling
        let totalDownloads = 0;
        try {
          // First check if the downloads stats document exists
          const statsDocRef = doc(db, 'stats', 'downloads');
          const statsDoc = await getDoc(statsDocRef);
          
          if (statsDoc.exists()) {
            // If the stats document exists, use its count
            totalDownloads = statsDoc.data().count || 0;
          } else {
            // Otherwise try to count from the downloads collection
            try {
              const downloadsQuery = collection(db, 'download_logs');
              const downloadsSnapshot = await getCountFromServer(downloadsQuery);
              totalDownloads = downloadsSnapshot.data().count;
              
              // Create the stats document for future use
              await setDoc(statsDocRef, { 
                count: totalDownloads,
                lastUpdated: new Date().toISOString()
              });
            } catch (downloadErr) {
              console.log('Download logs collection not found:', downloadErr);
              
              // Create the stats document with 0 downloads
              await setDoc(statsDocRef, { 
                count: 0,
                lastUpdated: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.error('Error handling download stats:', err);
        }
        
        // Get recent trips
        const recentTripsQuery = query(
          collection(db, 'AiTrips'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const recentTripsSnapshot = await getDocs(recentTripsQuery);
        const recentTrips = recentTripsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Trip data:', data.id, data.createdAt);
          return {
            id: doc.id,
            ...data
          };
        });
        
        setStats({
          totalUsers,
          totalTrips,
          totalDownloads,
          recentTrips
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Users Stat Card */}
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          description="Registered users"
          icon={<Users className="h-8 w-8 text-blue-500" />}
          color="blue"
        />
        
        {/* Trips Stat Card */}
        <StatCard 
          title="Total Trips" 
          value={stats.totalTrips}
          description="AI-generated trips"
          icon={<Map className="h-8 w-8 text-green-500" />}
          color="green"
        />
        
        {/* Downloads Stat Card */}
        <StatCard 
          title="Total Downloads" 
          value={stats.totalDownloads}
          description="PDF downloads"
          icon={<Download className="h-8 w-8 text-purple-500" />}
          color="purple"
        />
      </div>
      
      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>Latest trips generated by users</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentTrips.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No trips found</p>
          ) : (
            <div className="space-y-4">
              {stats.recentTrips.map((trip) => (
                <div key={trip.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {trip.userSelection?.location || 'Unnamed Trip'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(trip.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {trip.userName || trip.userEmail || 'Anonymous'}
                      </p>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                      {trip.userSelection?.totalDays || 'N/A'} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, description, icon, color }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-3 rounded-full bg-opacity-10" style={{ backgroundColor: `rgba(var(--${color}-500-rgb), 0.1)` }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard; 