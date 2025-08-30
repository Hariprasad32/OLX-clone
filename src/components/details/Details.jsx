import { useLocation } from "react-router-dom";
import { itemsContext } from "../context/Item";
import Navbar from "../navbar/Navbar";
import Sell from "../modal/Sell";
import Login from "../modal/Login";
import { useState } from "react";


export default function Details() {

  const location = useLocation();
  const { item } = location.state || {};

  const [openModal, setModal] = useState(false);
  const [openModalSell, setModalSell] = useState(false);

  const itemsCtx = itemsContext();

  const toggleModal = () => setModal(!openModal);
  const toggleModalSell = () => setModalSell(!openModalSell);

  if (!item) {
    return <p>No item data available</p>;
  }

  return (
    <>
      <Navbar toggleModalSell={toggleModalSell} toggleModal={toggleModal} />
      <Login toggleModal={toggleModal} status={openModal} />

      <div className="grid gap-0 sm:gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 p-10 px-5 sm:px-15 md:px-30 lg:px-40">
        <div className="border-2 w-full rounded-lg flex justify-center overflow-hidden h-96">
          <img
            className="object-cover"
            src={item.imageUrl || 'https://via.placeholder.com/150'}
            alt={item.title}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
          />
        </div>
        <div className="flex flex-col relative w-full">
          <p className="p-1 pl-0 text-2xl font-bold">₹ {item.price}</p>
          {/* <p className="p-1 pl-0 text-base">{item.category}</p> */}
          <p className="p-1 pl-0 text-xl font-bold">{item.title}</p>
          <p className="p-1 pl-0 sm:pb-0 break-words text-ellipsis overflow-hidden w-full">
            {item?.description}
          </p>
          <div className="w-full relative sm:relative md:absolute bottom-0 flex justify-between">
            <p className="p-1 pl-0 font-bold">Seller: {item.userName}</p>
            <p className="p-1 pl-0 text-sm">{item.createdAt}</p>
          </div>
        </div>
      </div>

      <Sell setItems={itemsCtx.setItems} toggleModalSell={toggleModalSell} status={openModalSell} />
    </>
  );
}