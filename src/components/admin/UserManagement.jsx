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
import { CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const userData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {users.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No users found</p>
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
              {users.map((user) => (
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
                    {user.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
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