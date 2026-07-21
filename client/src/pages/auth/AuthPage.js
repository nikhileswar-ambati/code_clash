import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import AuthModal from '../../components/Modals/AuthModal';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { supabase } from '../../supabase/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedHero from '../../components/SharedHero';

export default function AuthPage() {
  const navigate = useNavigate();
  const authModal = useRecoilValue(authModalState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user session:', error.message);
        return null;
      }

      return session?.user;
    };

    const fetchData = async () => {
      const userData = await getUserSession();
      setUser(userData);
      setPageLoading(false);

    };

    fetchData();
  }, [navigate]);

  if (pageLoading) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#111827_45%,#0f172a_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Navbar />
        <div className="grid grid-cols-1 gap-8 pt-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <SharedHero
              eyebrow="Code Clash"
              title="Create a live coding battle in seconds."
              description="Random problems, inbuilt compiler, sample test checks, live chat, runtime race, and a focused contest screen without extra navigation."
            >
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <button
                  onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true, type: 'login' }))}
                  className="px-8 py-3 bg-emerald-400 text-gray-950 rounded-lg font-semibold hover:bg-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign In to Clash
                </button>
              ) : (
                <button
                  onClick={() => navigate('/clash')}
                  className="px-8 py-3 bg-emerald-400 text-gray-950 rounded-lg font-semibold hover:bg-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Open Clash
                </button>
              )}
              <button
                onClick={() => navigate('/problems')}
                className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                View Problems
              </button>
            </div>
            </SharedHero>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-lg border border-white/10 bg-dark-layer-1/80 p-5 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="rounded bg-white/5 p-4"><p className="text-2xl font-bold text-white">30</p><p>Max players</p></div>
              <div className="rounded bg-white/5 p-4"><p className="text-2xl font-bold text-white">Live</p><p>Chat and joins</p></div>
              <div className="rounded bg-white/5 p-4"><p className="text-2xl font-bold text-white">Run</p><p>Sample tests</p></div>
              <div className="rounded bg-white/5 p-4"><p className="text-2xl font-bold text-white">Race</p><p>Runtime ranking</p></div>
            </div>
          </motion.div>
        </div>
      </div>
      {authModal.isOpen && <AuthModal/>}
    </div>
  )
}
