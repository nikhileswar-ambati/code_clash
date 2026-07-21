import React, { useCallback, useEffect } from 'react'
import { IoClose } from "react-icons/io5";
import Login from './Login';
import Signup from './SignUp';
import ResetPassword from './ResetPassword';
import { useRecoilValue } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { useSetRecoilState } from 'recoil';


export default function AuthModal() {
  const authModal = useRecoilValue(authModalState);
  const closeModal = useCloseModal();
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[100]" onClick={closeModal}></div>
      <div className="w-full sm:w-[450px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center z-[101]">
        <div className="relative w-full h-full mx-auto flex items-center justify-center">
          <div className="relative mx-6 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                className="bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-800 hover:text-white text-white"
                onClick={closeModal}
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
            {authModal.type === "login" ? <Login /> : authModal.type === "register" ? <Signup /> : <ResetPassword />}
          </div>
        </div>
      </div>
    </>
  )
}

function useCloseModal() {
    const setAuthModal = useSetRecoilState(authModalState);
    const closeModal = useCallback(() => {
      setAuthModal((prev) => ({ ...prev, isOpen: false, type: "login" }));
    }, [setAuthModal]);
  
    useEffect(() => {
      const handleEsc = (e) => {
        if (e.key === "Escape") closeModal();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);
  
    return closeModal;
  }