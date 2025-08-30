import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhIrln5GTPYDftuaI6QOHGW1cC5AZggLA",
  authDomain: "olx-clone-f1f2a.firebaseapp.com",
  projectId: "olx-clone-f1f2a",
  storageBucket: "olx-clone-f1f2a.firebasestorage.app",
  messagingSenderId: "676575898013",
  appId: "1:676575898013:web:4fa622439ef58cf53d6774"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
const fireStore = getFirestore(app);

const fetchFromFireStore = async () => {
  try {
    const productsCollection = collection(fireStore, 'products');
    const productSnapshot = await getDocs(productsCollection);
    const productList = productSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return productList;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return [];
  }
};

export { auth, provider, storage, fireStore, fetchFromFireStore };