import { db, auth } from './firebaseConfig';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    setDoc,
    deleteDoc,
    limit 
} from 'firebase/firestore';

/**
 * Test Firestore connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export const testFirestoreConnection = async () => {
    try {
        // Simple test query
        const testQuery = query(collection(db, 'AiTrips'), limit(1));
        const result = await getDocs(testQuery);
        console.log("Firestore connection test: Success");
        console.log("Documents found:", result.size);
        return true;
    } catch (error) {
        console.error("Firestore connection test: Failed", error);
        return false;
    }
};

/**
 * Get trip by ID
 * @param {string} tripId - The trip ID
 * @returns {Promise<object|null>} - The trip document or null
 */
export const getTripById = async (tripId) => {
    try {
        const tripRef = doc(db, "AiTrips", tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (tripSnap.exists()) {
            console.log(`Trip with ID ${tripId} found:`, tripSnap.data());
            return tripSnap.data();
        } else {
            console.log(`Trip with ID ${tripId} not found`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting trip ${tripId}:`, error);
        return null;
    }
};

/**
 * Get trips for current user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of trips
 */
export const getUserTrips = async (userId) => {
    try {
        console.log("Fetching trips for user:", userId);
        
        const q = query(
            collection(db, "AiTrips"),
            where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Query returned", querySnapshot.size, "documents");
        
        const trips = [];
        querySnapshot.forEach(doc => {
            console.log("Trip found:", doc.id);
            trips.push(doc.data());
        });
        
        return trips;
    } catch (error) {
        console.error("Error getting user trips:", error);
        throw error;
    }
};

/**
 * Test creating a trip
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The created trip ID
 */
export const createTestTrip = async (userId, userEmail, displayName) => {
    try {
        const tripId = `test_${Date.now()}`;
        console.log("Creating test trip with ID:", tripId);
        
        const tripData = {
            id: tripId,
            userId: userId,
            userEmail: userEmail,
            userName: displayName || 'Test User',
            createdAt: new Date().toISOString(),
            userSelection: {
                location: "Test Location",
                totalDays: 3,
                budget: "Budget",
                traveler: "Solo"
            },
            tripData: {
                title: "Test Trip",
                days: [
                    { day: 1, activities: ["Test Activity 1"] },
                    { day: 2, activities: ["Test Activity 2"] },
                    { day: 3, activities: ["Test Activity 3"] }
                ]
            }
        };
        
        await setDoc(doc(db, "AiTrips", tripId), tripData);
        console.log("Test trip created successfully");
        return tripId;
    } catch (error) {
        console.error("Error creating test trip:", error);
        throw error;
    }
};

/**
 * Delete a test trip
 * @param {string} tripId - The trip ID to delete
 * @returns {Promise<boolean>} - True if deletion successful
 */
export const deleteTestTrip = async (tripId) => {
    try {
        await deleteDoc(doc(db, "AiTrips", tripId));
        console.log("Test trip deleted successfully");
        return true;
    } catch (error) {
        console.error("Error deleting test trip:", error);
        return false;
    }
};

/**
 * Full Firestore test (connection, create, get, delete)
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Test results
 */
export const runFirestoreTest = async (userId, userEmail, displayName) => {
    console.log("Running full Firestore test");
    const results = {
        connection: false,
        create: false,
        get: false,
        delete: false,
        getUserTrips: false
    };
    
    let testTripId = null;
    
    try {
        // Test connection
        results.connection = await testFirestoreConnection();
        
        if (!results.connection) {
            return results;
        }
        
        // Test create trip
        testTripId = await createTestTrip(userId, userEmail, displayName);
        results.create = true;
        
        // Test get trip by ID
        const trip = await getTripById(testTripId);
        results.get = !!trip;
        
        // Test get user trips
        const trips = await getUserTrips(userId);
        results.getUserTrips = trips.length > 0;
        
        // Test delete trip
        if (testTripId) {
            results.delete = await deleteTestTrip(testTripId);
        }
        
        console.log("Firestore test results:", results);
        return results;
    } catch (error) {
        console.error("Firestore test failed:", error);
        return results;
    }
};

export default {
    testFirestoreConnection,
    getTripById,
    getUserTrips,
    createTestTrip,
    deleteTestTrip,
    runFirestoreTest
}; 