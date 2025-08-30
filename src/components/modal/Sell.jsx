import { Modal, ModalBody } from "flowbite-react";
import { useState } from "react";
import Input from "../input/Input";
import { userAuth } from "../context/Auth";
import { addDoc, collection } from "firebase/firestore";
import { fetchFromFireStore, fireStore } from "../firebase/Firebase";
import fileUpload from '../../assets/fileUpload.svg';
import loading from '../../assets/loading.gif';
import close from '../../assets/close.svg';

export default function Sell({ toggleModalSell, status, setItems }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image: "",
  });

  const auth = userAuth();

  const handleImage = (e) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      category: "",
      price: "",
      description: "",
      image: "",
    };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }
    if (!category.trim()) {
      newErrors.category = "Category is required";
      isValid = false;
    }
    if (!price.trim()) {
      newErrors.price = "Price is required";
      isValid = false;
    } else if (isNaN(parseFloat(price.trim())) || parseFloat(price.trim()) <= 0) {
      newErrors.price = "Price must be a valid positive number";
      isValid = false;
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }
    if (!image) {
      newErrors.image = "Image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth?.user) {
      alert("Please login to continue");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const readImageAsDataUrl = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result;
          localStorage.setItem(`image_${file.name}`, imageUrl);
          resolve(imageUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    let imageUrl = '';
    if (image) {
      try {
        imageUrl = await readImageAsDataUrl(image);
      } catch (error) {
        console.error(error);
        alert('Failed to read image');
        setSubmitting(false);
        return;
      }
    }

    try {
      await addDoc(collection(fireStore, "products"), {
        title: title.trim(),
        category: category.trim(),
        price: parseFloat(price.trim()),
        imageUrl,
        description: description.trim(),
        userId: auth.user.uid || "Anonymous",
        userName:auth.user.displayName,
        createdAt: new Date().toDateString(),
      });

      setTitle("");
      setCategory("");
      setPrice("");
      setDescription("");
      setImage(null);
      setErrors({ title: "", category: "", price: "", description: "", image: "" });

      const data = await fetchFromFireStore();
      setItems(data);

      toggleModalSell();
    } catch (error) {
      console.error("Error adding item to FireStore:", error);
      alert("Failed to add item to FireStore");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Modal
        theme={{
          content: {
            base: "relative w-full p-4 md:h-auto",
            inner: "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700",
          },
        }}
        show={status}
        onClose={toggleModalSell}
        position="center"
        size="md"
        popup={true}
      >
        <ModalBody className="bg-white h-96 p-0 rounded-md" onClick={(e) => e.stopPropagation()}>
          <img
            src={close}
            alt="Close"
            className="w-6 absolute z-10 top-6 right-8 cursor-pointer"
            onClick={() => {
              toggleModalSell();
              setImage(null);
              setErrors({ title: "", category: "", price: "", description: "", image: "" });
            }}
          />
          <div className="p-6 pl-8 pr-8 pb-8">
            <p className="font-bold text-lg mb-3">Sell Item</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <Input setInput={setTitle} value={title} placeholder="Title" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setCategory} value={category} placeholder="Category" />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setPrice} value={price} placeholder="Price" type="number" />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div className="mb-2">
                <Input setInput={setDescription} value={description} placeholder="Description" />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="pt-12 w-full relative">
                {image ? (
                  <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black border-solid rounded-md overflow-hidden">
                    <img src={URL.createObjectURL(image)} alt="Uploaded" />
                  </div>
                ) : (
                  <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
                    <input
                      type="file"
                      onChange={handleImage}
                      className="absolute inset-10 h-full w-full opacity-0 cursor-pointer z-30"
                    />
                    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                      <img src={fileUpload} alt="Upload" className="w-12" />
                    </div>
                  </div>
                )}
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              </div>

              {submitting ? (
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
                    Sell Item
                  </button>
                </div>
              )}
            </form>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}