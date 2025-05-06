import React, { useState, useEffect } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
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
import { CheckCircle, XCircle, Search } from 'lucide-react';
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
    return 'Unknown';
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
    return 'Unknown';
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        
        const userData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        
        // Sort by creation date - newest first
        userData.sort((a, b) => {
          try {
            // Handle different date formats
            const getTime = (date) => {
              if (typeof date?.toDate === 'function') return date.toDate().getTime();
              if (typeof date === 'string') return new Date(date).getTime();
              if (date instanceof Date) return date.getTime();
              return 0;
            };
            
            const timeA = getTime(a.createdAt) || 0;
            const timeB = getTime(b.createdAt) || 0;
            
            return timeB - timeA; // Newest first
          } catch (err) {
            return 0;
          }
        });
        
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please check the console for details.');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !currentStatus }
          : user
      ));
      
      toast.success(`User is now ${!currentStatus ? 'an admin' : 'a regular user'}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const name = (user.displayName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || email.includes(search);
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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          className="pl-10"
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {user.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName} 
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      {user.displayName || 'Unknown User'}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.isAdmin ? "default" : "secondary"}
                      className={user.isAdmin ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                      className={user.isAdmin 
                        ? "text-red-500 hover:text-red-700" 
                        : "text-green-500 hover:text-green-700"
                      }
                    >
                      {user.isAdmin ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Remove Admin
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Make Admin
                        </>
                      )}
                    </Button>
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

export default UserManagement; 