import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { fireStore } from '../firebase/Firebase';
import { userAuth } from '../context/Auth';
import { Modal, ModalBody } from "flowbite-react";
import Input from "../input/Input";
import close from '../../assets/close.svg';
import fileUpload from '../../assets/fileUpload.svg';
// import loading from '../../assets/loading.gif';

const MyAdsPage = () => {
  const { user, loading: authLoading } = userAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
  });

  console.log('User in MyAdsPage:', user);

  // Fetch user's ads from Firebase
  useEffect(() => {
    const fetchUserAds = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productsCollection = collection(fireStore, 'products');
        const userAdsQuery = query(productsCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(userAdsQuery);
        
        const userAds = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || data.name || 'Untitled',
            price: data.price ? `₹${data.price.toLocaleString()}` : 'Price not set',
            originalPrice: data.price || 0,
            location: data.location || 'Location not specified',
            category: data.category || 'Uncategorized',
            description: data.description || '',
            imageUrl: data.imageUrl || '/api/placeholder/300/200',
            createdAt: data.createdAt,
            ...data
          };
        });
        
        setAds(userAds);
      } catch (error) {
        console.error('Error fetching user ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAds();
  }, [user, authLoading]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await deleteDoc(doc(fireStore, 'products', id));
      setAds(prevAds => prevAds.filter(ad => ad.id !== id));
      alert('Ad deleted successfully!');
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Failed to delete the ad. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditCategory(ad.category);
    setEditPrice(ad.originalPrice.toString());
    setEditDescription(ad.description);
    setEditImage(null);
    setEditErrors({ title: "", category: "", price: "", description: "" });
    setShowEditModal(true);
  };

  const handleEditImage = (e) => {
    if (e.target.files) {
      setEditImage(e.target.files[0]);
    }
  };

  const validateEditForm = () => {
    const newErrors = {
      title: "",
      category: "",
      price: "",
      description: "",
    };
    let isValid = true;

    if (!editTitle.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }
    if (!editCategory.trim()) {
      newErrors.category = "Category is required";
      isValid = false;
    }
    if (!editPrice.trim()) {
      newErrors.price = "Price is required";
      isValid = false;
    } else if (isNaN(parseFloat(editPrice.trim())) || parseFloat(editPrice.trim()) <= 0) {
      newErrors.price = "Price must be a valid positive number";
      isValid = false;
    }
    if (!editDescription.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    setEditErrors(newErrors);
    return isValid;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setEditSubmitting(true);

    try {
      const updateData = {
        title: editTitle.trim(),
        category: editCategory.trim(),
        price: parseFloat(editPrice.trim()),
        description: editDescription.trim(),
      };

      // Handle image update if a new image is selected
      if (editImage) {
        const readImageAsDataUrl = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const imageUrl = reader.result;
              resolve(imageUrl);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        };

        const imageUrl = await readImageAsDataUrl(editImage);
        updateData.imageUrl = imageUrl;
      }

      await updateDoc(doc(fireStore, 'products', editingAd.id), updateData);

      // Update the local state
      setAds(prevAds =>
        prevAds.map(ad =>
          ad.id === editingAd.id
            ? {
                ...ad,
                title: updateData.title,
                category: updateData.category,
                price: `₹${updateData.price.toLocaleString()}`,
                originalPrice: updateData.price,
                description: updateData.description,
                imageUrl: updateData.imageUrl || ad.imageUrl,
              }
            : ad
        )
      );

      setShowEditModal(false);
      alert('Ad updated successfully!');
    } catch (error) {
      console.error('Error updating ad:', error);
      alert('Failed to update the ad. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAd(null);
    setEditImage(null);
    setEditErrors({ title: "", category: "", price: "", description: "" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your ads...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h3>
          <p className="text-gray-600">You need to be logged in to view your ads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-600 mt-1">Manage your advertisements</p>
        </div>

        {ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads found</h3>
            <p className="text-gray-600">You haven't posted any ads yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map(ad => (
              <div key={ad.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Ad Image */}
                    <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/200';
                        }}
                      />
                    </div>

                    {/* Ad Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {ad.title}
                      </h3>
                      
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {ad.price}
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <span>{ad.location}</span> • <span>{ad.category}</span>
                      </div>

                      <div className="text-sm text-gray-500 line-clamp-2">
                        {ad.description}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleteLoading === ad.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        {deleteLoading === ad.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deleteLoading === ad.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        theme={{
          content: {
            base: "relative w-full p-4 md:h-auto",
            inner: "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700",
          },
        }}
        show={showEditModal}
        onClose={closeEditModal}
        position="center"
        size="md"
        popup={true}
      >
        <ModalBody className="bg-white h-96 p-0 rounded-md" onClick={(e) => e.stopPropagation()}>
          <img
            src={close}
            alt="Close"
            className="w-6 absolute z-10 top-6 right-8 cursor-pointer"
            onClick={closeEditModal}
          />
          <div className="p-6 pl-8 pr-8 pb-8">
            <p className="font-bold text-lg mb-3">Edit Item</p>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-2">
                <Input setInput={setEditTitle} value={editTitle} placeholder="Title" />
                {editErrors.title && <p className="text-red-500 text-sm mt-1">{editErrors.title}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setEditCategory} value={editCategory} placeholder="Category" />
                {editErrors.category && <p className="text-red-500 text-sm mt-1">{editErrors.category}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setEditPrice} value={editPrice} placeholder="Price" type="number" />
                {editErrors.price && <p className="text-red-500 text-sm mt-1">{editErrors.price}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setEditDescription} value={editDescription} placeholder="Description" />
                {editErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{editErrors.description}</p>
                )}
              </div>

              <div className="pt-12 w-full relative">
                {editImage ? (
                  <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black border-solid rounded-md overflow-hidden">
                    <img src={URL.createObjectURL(editImage)} alt="New Upload" className="w-full h-full object-cover" />
                  </div>
                ) : editingAd?.imageUrl ? (
                  <div className="relative h-40 sm:h-60 w-full border-2 border-gray-300 border-solid rounded-md overflow-hidden">
                    <img src={editingAd.imageUrl} alt="Current" className="w-full h-full object-cover" />
                    <input
                      type="file"
                      onChange={handleEditImage}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Click to change
                    </div>
                  </div>
                ) : (
                  <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
                    <input
                      type="file"
                      onChange={handleEditImage}
                      className="absolute inset-10 h-full w-full opacity-0 cursor-pointer z-30"
                    />
                    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                      <img src={fileUpload} alt="Upload" className="w-12" />
                    </div>
                  </div>
                )}
              </div>

              {editSubmitting ? (
                <div className="w-full flex h-14 justify-center pt-4 pb-2">
                  <img className="w-32 object-cover" src={loading} alt="Loading" />
                </div>
              ) : (
                <div className="w-full pt-2">
                  <button
                    className="w-full p-3 rounded-lg text-white"
                    style={{ backgroundColor: '#002f34' }}
                    type="submit"
                  >
                    Update Item
                  </button>
                </div>
              )}
            </form>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MyAdsPage;