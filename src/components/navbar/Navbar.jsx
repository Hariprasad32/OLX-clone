import './Navbar.css';
import logo from '../../assets/symbol.png';
import search from '../../assets/search1.svg';
import arrow from '../../assets/arrow-down.svg';
import searchwt from '../../assets/search.svg';
import addBtn from '../../assets/addButton.png';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/Firebase';
import { signOut } from 'firebase/auth';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function Navbar({ toggleModal, toggleModalSell, onCategorySelect }) {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); 
  
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMyAds = () => {
    navigate('/my-ads'); 
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <nav className="fixed z-50 w-full p-2 pl-3 pr-3 shadow-md bg-slate-100 border-b-4 border-solid border-b-white flex items-center">
        <img src={logo} alt="Logo" className="w-12 mr-3" />

        <div className="relative locality-search">
          <img src={search} alt="Search" className="absolute top-4 left-2 w-5 locality-search" />
          <input
            type="text"
            placeholder="search city, area, or locality..."
            className="w-[50px] sm:w-[150px] md:w-[230px] lg:w-[250px] p-3 pl-8 pr-8 border-black border-solid border-2 rounded-md truncate focus:outline-none focus:border-teal-300 placeholder:text-gray-400"
          />
          <img src={arrow} alt="Arrow" className="absolute top-4 right-3 w-5 cursor-pointer" />
        </div>

        <div className="ml-5 mr-2 relative w-full main-search">
          <input
            type="text"
            placeholder="Find Cars, Mobile phones, and More..."
            className="w-full p-3 pr-10 border-black border-2 border-solid rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300"
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2 bg-[] p-1 rounded">
            <img src={searchwt} alt="Search-icon" className="w-5 filter invert" />
          </div>
        </div>

        
        <div className="md:hidden ml-3">
          <button onClick={toggleMenu} className="focus:outline-none p-2 rounded hover:bg-slate-200">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>

        
        <div className="hidden md:flex md:items-center">
          <div className="mx-1 sm:ml-5 sm:mr-5 relative lang">
            <p className="font-bold mr-3">English</p>
            <img src={arrow} alt="Arrow" className="w-5 cursor-pointer" />
          </div>

          {user ? (
            <div className="relative z-[60]" ref={dropdownRef}>
              <div 
                className="flex items-center cursor-pointer hover:bg-slate-200 p-2 rounded"
                onClick={toggleDropdown}
              >
                <p style={{ color: '#002f34' }} className="font-bold mr-2">
                  {user.displayName?.split(' ')[0]}
                </p>
                <img 
                  src={arrow} 
                  alt="Arrow" 
                  className={`w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
              
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white border border-gray-300 rounded-lg shadow-2xl z-[100]">

                  <div className="py-2">
                    <button
                      onClick={handleMyAds}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001-1h6a1 1 0 001 1v1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium" style={{ color: '#002f34' }}>My ADS</span>
                    </button>


                    <hr className="my-2 border-gray-200" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium" style={{ color: '#002f34' }}>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p
              className="font-bold underline ml-5 cursor-pointer"
              style={{ color: '#002f34' }}
              onClick={toggleModal}
            >
              Login
            </p>
          )}

          <div className='w-28 mr-3'>
            <img
              src={addBtn}
              onClick={user ? toggleModalSell : toggleModal}
              className="w-24 mx-1 sm:ml-5 sm:mr-5 shadow-xl rounded-full cursor-pointer "
              alt="Add Button"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed z-50 w-full bg-slate-100 shadow-md p-4 top-[68px]">

          <div className="relative small-search-box ">
            <img src={search} alt="Search" className="absolute top-4 left-2 w-5 locality-search" />
            <input
              type="text"
              placeholder="search city, area, or locality..."
              className="w-[50px] sm:w-[150px] md:w-[250px] lg:w-[270px] p-3 pl-8 pr-8 border-black border-solid border-2 rounded-md truncate focus:outline-none focus:border-teal-300 placeholder:text-gray-400"
            />
            <img src={arrow} alt="Arrow" className="absolute top-4 right-3 w-5 cursor-pointer" />
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center lang">
              <p className="font-bold mr-3">English</p>
              <img src={arrow} alt="Arrow" className="w-5 cursor-pointer" />
            </div>

            {user ? (
              <div className="flex flex-col space-y-2">
                <p style={{ color: '#002f34' }} className="font-bold cursor-pointer">
                  {user.displayName?.split(' ')[0]}
                </p>
                <button
                  onClick={handleMyAds}
                  className="text-left font-bold cursor-pointer hover:underline"
                  style={{ color: '#002f34' }}
                >
                  My Ads
                </button>
                <p
                  style={{ color: '#002f34' }}
                  className="font-bold cursor-pointer underline"
                  onClick={handleLogout}
                >
                  Logout
                </p>
              </div>
            ) : (
              <p
                className="font-bold underline cursor-pointer"
                style={{ color: '#002f34' }}
                onClick={toggleModal}
              >
                Login
              </p>
            )}

            <img
              src={addBtn}
              onClick={user ? toggleModalSell : toggleModal}
              className="w-24 shadow-xl rounded-full cursor-pointer"
              alt="Add Button"
            />
          </div>
        </div>
      )}

      <div className="w-full relative z-0 flex shadow-md p-2 pt-20 pl-10 pr-10 sm:pl-44 md:pr-44 sub-lists">
        <ul className="list-none flex items-center justify-between w-full">
          <div
            className="flex flex-shrink-0 cursor-pointer" 
            onClick={() => onCategorySelect(null)} 
          >
            <p className="font-semibold uppercase all-cats"> All categories</p>
            <img className="w-4 ml-2" src={arrow} alt="Arrow" />
          </div>

          <li className="cursor-pointer" onClick={() => onCategorySelect('Cars')}>Cars</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('Shirt')}>Shirt</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('Shoes')}>Shoes</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('Apartment')}>For sale: Houses & Apartments</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('Scooter')}>Scooter</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('Commercial & Other Vehicles')}>Commercial & Other Vehicles</li>
          <li className="cursor-pointer" onClick={() => onCategorySelect('For rent: Houses & Apartments')}>For rent: Houses & Apartments</li>
        </ul>
      </div>
    </div>
  );
}