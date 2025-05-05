import React, { useState, useEffect } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, orderBy, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DownloadAnalytics = () => {
  const [downloads, setDownloads] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchDownloadData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent downloads
        const downloadsQuery = query(
          collection(db, 'download_logs'),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const downloadsSnapshot = await getDocs(downloadsQuery);
        
        const downloadsData = downloadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDownloads(downloadsData);
        
        // Calculate most popular trip destinations
        const tripCounts = downloadsData.reduce((acc, download) => {
          const destination = download.tripDestination || 'Unknown';
          acc[destination] = (acc[destination] || 0) + 1;
          return acc;
        }, {});
        
        const sortedTrips = Object.entries(tripCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([destination, count]) => ({ destination, count }));
          
        setPopularTrips(sortedTrips);
        
        // Fetch user details for each download
        const userIds = [...new Set(downloadsData.map(download => download.userId).filter(Boolean))];
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
        console.error('Error fetching download data:', error);
        toast.error('Failed to load download analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDownloadData();
  }, []);

  // Group downloads by date (for statistics)
  const downloadsByDate = downloads.reduce((acc, download) => {
    const date = download.timestamp?.toDate().toLocaleDateString() || 'Unknown date';
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  // Convert to array for display
  const downloadStats = Object.entries(downloadsByDate)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .slice(0, 7); // Show last 7 days

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Download Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Downloads by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            {downloadStats.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No download data available</p>
            ) : (
              <div className="space-y-4">
                {downloadStats.map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center">
                    <span>{date}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: `${Math.min(100, count * 10)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Popular Trip Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {popularTrips.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No data available</p>
            ) : (
              <div className="space-y-4">
                {popularTrips.map(({ destination, count }) => (
                  <div key={destination} className="flex justify-between items-center">
                    <span className="truncate max-w-[150px]">{destination}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: `${Math.min(100, count * 20)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="font-bold">{count} downloads</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Download Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Download Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {downloads.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No download history available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Trip Destination</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {userMap[download.userId]?.photoURL && (
                          <img 
                            src={userMap[download.userId].photoURL} 
                            alt={userMap[download.userId].displayName} 
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        )}
                        {userMap[download.userId]?.displayName || download.userId || 'Unknown User'}
                      </div>
                    </TableCell>
                    <TableCell>{download.tripDestination || 'Unknown destination'}</TableCell>
                    <TableCell>
                      {download.timestamp?.toDate().toLocaleString() || 'Unknown time'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadAnalytics; 