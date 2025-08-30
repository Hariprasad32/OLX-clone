import { useReducer, useEffect } from 'react';
import Mobile from '../../assets/mobile.svg';
import Guitar from '../../assets/guitar.png';
import Love from '../../assets/love.png';
import Close from '../../assets/close.svg';
import Avatar from '../../assets/avatar.png';
import Google from '../../assets/google.png';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/Firebase';

const initialState = {
  isOpen: false,
  currentSlide: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODAL':
      return { ...state, isOpen: action.payload };
    case 'SET_SLIDE':
      return { ...state, currentSlide: action.payload };
    case 'NEXT_SLIDE':
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % action.totalSlides,
      };
    case 'PREV_SLIDE':
      return {
        ...state,
        currentSlide:
          (state.currentSlide - 1 + action.totalSlides) % action.totalSlides,
      };
    default:
      return state;
  }
};

const slides = [
  {
    img: Guitar,
    text: 'Help us become one of the safest place to buy and sell.',
  },
  {
    img: Love,
    text: 'Close deals from the comfort of your home.',
  },
  {
    img: Avatar,
    text: 'Keep all your favorites in one place.',
  },
];

export default function Login({ toggleModal, status }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    isOpen: status,
  });

  useEffect(() => {
    dispatch({ type: 'SET_MODAL', payload: status });
  }, [status]);

  const handleClick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch({ type: 'SET_MODAL', payload: false });
      toggleModal();
      console.log('User', result.user);
    } catch (error) {
      console.error('Authentication error:', error.code, error.message);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  const handleNextSlide = () => {
    dispatch({ type: 'NEXT_SLIDE', totalSlides: slides.length });
  };

  const handlePrevSlide = () => {
    dispatch({ type: 'PREV_SLIDE', totalSlides: slides.length });
  };

  const handleIndicatorClick = (index) => {
    dispatch({ type: 'SET_SLIDE', payload: index });
  };

  return (
    <>
      {state.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            dispatch({ type: 'SET_MODAL', payload: false });
            toggleModal();
          }}
        >
          <div
            className="relative bg-white rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={Close}
              alt="Close"
              className="w-6 absolute top-4 right-4 cursor-pointer"
              onClick={() => {
                dispatch({ type: 'SET_MODAL', payload: false });
                toggleModal();
              }}
            />

            <div className="relative w-full h-56 mb-5">
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={slides[state.currentSlide].img}
                  alt={`Slide ${state.currentSlide + 1}`}
                  className="w-24 mb-5"
                />
                <p
                  style={{ color: '#002f34' }}
                  className="w-60 sm:w-72 text-center mb-5 font-semibold"
                >
                  {slides[state.currentSlide].text}
                </p>
              </div>

              <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-transparent text-black"
                onClick={handlePrevSlide}
              >
                <svg
                  className="w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-transparent text-black"
                onClick={handleNextSlide}
              >
                <svg
                  className="w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      state.currentSlide === index ? 'bg-teal-300' : 'bg-gray-300'
                    }`}
                    onClick={() => handleIndicatorClick(index)}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 pt-0">
              <div
                className="flex items-center justify-center rounded-md border-2 border-black p-5 pl-4 mb-4 h-8"
              >
                <p className="text-sm font-bold flex items-center">
                  <img src={Mobile} alt="Mobile" className="w-6 mr-2" />
                  Continue with phone
                </p>
              </div>
              <div
                className="flex items-center justify-center rounded-md border-2 border-gray-300 p-5 h-8 cursor-pointer active:bg-teal-100"
                onClick={handleClick}
              >
                <p className="text-sm text-gray-500 flex items-center">
                  <img src={Google} alt="Google" className="w-7 mr-2" />
                  Continue with Google
                </p>
              </div>
              <div className="pt-5 flex flex-col items-center justify-center">
                <p className="font-semibold text-sm">OR</p>
                <p className="font-bold text-sm pt-3 underline underline-offset-4">
                  Login with Email
                </p>
              </div>
              <div className="pt-10 sm:pt-20 flex flex-col items-center justify-center">
                <p className="text-xs">All your personal details are safe with us.</p>
                <p className="text-xs pt-5 text-center">
                  If you continue, you are accepting{' '}
                  <span className="text-blue-600">
                    OLX Terms and Conditions and Privacy Policy
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}