import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import AuthModal from "../../components/Modals/AuthModal";
import { authModalState } from "../../atoms/authModalAtom";
import { supabase } from "../../supabase/supabase";
import ClashHomeSection from "../../features/clash/ClashHomeSection";
import SharedHero from "../../components/SharedHero";

export default function ClashPage() {
  const authModal = useRecoilValue(authModalState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().finally(() => setPageLoading(false));
  }, []);

  if (pageLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Navbar />
        <SharedHero
          eyebrow="Code Clash"
          title="Create or join a coding battle."
          description="Set the difficulty, invite players, run sample tests, and race on accepted submissions."
        >
          <div className="flex flex-wrap gap-3">
            <Link to="/clash/history" className="rounded bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">History</Link>
            <Link to="/clash/leaderboard" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-gray-950 hover:bg-emerald-300">Leaderboard</Link>
          </div>
        </SharedHero>
        <div>
          <ClashHomeSection
            onRequireAuth={() =>
              setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }))
            }
          />
        </div>
      </div>
      {authModal.isOpen && <AuthModal />}
    </div>
  );
}
