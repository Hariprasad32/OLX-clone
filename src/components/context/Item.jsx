import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { fireStore } from "../firebase/Firebase";

const Context = createContext(null);
export const itemsContext = () => useContext(Context);

export default function ItemContextProvider({ children }) {
  const [items, setItems] = useState([]);
  const [userAds, setUserAds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAdsLoading, setUserAdsLoading] = useState(false);

  // Fetch all items (for general use)
  useEffect(() => {
    const fetchItemFromFirestore = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(fireStore, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(productList);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemFromFirestore();
  }, []);

  // Fetch user-specific ads
  const fetchUserAds = async (userId) => {
    if (!userId) {
      setUserAds([]);
      return;
    }

    try {
      setUserAdsLoading(true);
      const productsCollection = collection(fireStore, 'products');
      const userAdsQuery = query(
        productsCollection, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc') // Order by creation date, newest first
      );
      const querySnapshot = await getDocs(userAdsQuery);
      
      const userAdsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUserAds(userAdsList);
      setError(null);
    } catch (error) {
      console.error('Error fetching user ads:', error);
      setError('Failed to fetch your ads. Please try again later.');
    } finally {
      setUserAdsLoading(false);
    }
  };

  // Add new item to the items array (for real-time updates)
  const addItem = (newItem) => {
    setItems(prevItems => [newItem, ...prevItems]);
    // If the new item belongs to current user, also add to userAds
    setUserAds(prevUserAds => [newItem, ...prevUserAds]);
  };

  // Update item in both arrays
  const updateItem = (updatedItem) => {
    setItems(prevItems => 
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    setUserAds(prevUserAds => 
      prevUserAds.map(ad => ad.id === updatedItem.id ? updatedItem : ad)
    );
  };

  // Remove item from both arrays
  const removeItem = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setUserAds(prevUserAds => prevUserAds.filter(ad => ad.id !== itemId));
  };

  // Refresh all data
  const refreshData = async (userId = null) => {
    // Refresh all items
    try {
      setLoading(true);
      const productsCollection = collection(fireStore, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(productList);
      
      // If userId provided, also refresh user ads
      if (userId) {
        await fetchUserAds(userId);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    // General items
    items,
    setItems,
    
    // User-specific ads
    userAds,
    setUserAds,
    fetchUserAds,
    
    // Loading states
    loading,
    userAdsLoading,
    
    // Error handling
    error,
    setError,
    
    // CRUD operations
    addItem,
    updateItem,
    removeItem,
    
    // Utility functions
    refreshData,
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}