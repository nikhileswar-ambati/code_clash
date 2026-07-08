import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import AuthModal from "../../components/Modals/AuthModal";
import { authModalState } from "../../atoms/authModalAtom";
import SharedHero from "../../components/SharedHero";
import ClashSummary from "../../features/clash/ClashSummary";
import { formatDuration, getCurrentUser } from "../../features/clash/clashService";
import { supabase } from "../../supabase/supabase";

export default function ClashHistory() {
  const authModal = useRecoilValue(authModalState);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("Please sign in to view Clash history.");
          return;
        }
        setCurrentUserId(user.id);
        const { data, error: historyError } = await supabase
          .from("clash_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (historyError) throw historyError;
        setRows(data || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load Clash history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Navbar />
        <SharedHero
          eyebrow="Clash History"
          title="Review your completed coding battles."
          description="Open match details to see scores, replay summaries, runtime comparison, and practice insights."
        >
          <div className="flex flex-wrap gap-3">
            <Link to="/clash" className="rounded bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">Clash Home</Link>
            <Link to="/clash/leaderboard" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-gray-950 hover:bg-emerald-300">Leaderboard</Link>
          </div>
        </SharedHero>

        {loading && <p className="mt-8 text-gray-300">Loading history...</p>}
        {error && <p className="mt-8 rounded bg-red-500/10 p-4 text-red-200">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-dark-layer-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="p-3">Opponent</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Winner</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Replay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.clash_id}-${row.user_id}`} className="border-t border-white/10 text-gray-300">
                    <td className="p-3 text-white">{row.opponent_name}</td>
                    <td className="p-3">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="p-3">{row.winner_name}</td>
                    <td className="p-3">{row.score}</td>
                    <td className="p-3">{formatDuration(row.duration_seconds)}</td>
                    <td className="p-3"><button onClick={() => setSelected(row)} className="rounded bg-emerald-400 px-3 py-1 font-semibold text-gray-950">Details</button></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td className="p-6 text-center text-gray-400" colSpan="6">No Clash matches yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black/70 p-4">
            <div className="mx-auto max-w-5xl rounded-lg bg-dark-layer-2 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Replay Details</h2>
                <button onClick={() => setSelected(null)} className="rounded bg-white/10 px-3 py-2 hover:bg-white/20">Close</button>
              </div>
              <ClashSummary summary={selected.summary} questionCount={selected.replay_details?.problems?.length || 0} currentUserId={currentUserId} />
            </div>
          </div>
        )}
      </div>
      {authModal.isOpen && <AuthModal />}
    </div>
  );
}
