import React, { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import AuthModal from "../../components/Modals/AuthModal";
import { authModalState } from "../../atoms/authModalAtom";
import SharedHero from "../../components/SharedHero";
import { formatDuration } from "../../features/clash/clashService";
import { supabase } from "../../supabase/supabase";

export default function ClashLeaderboard() {
  const authModal = useRecoilValue(authModalState);
  const [history, setHistory] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: historyRows, error: historyError } = await supabase.from("clash_history").select("*");
        if (historyError) throw historyError;
        const { data: participantRows, error: participantError } = await supabase.from("clash_participants").select("*");
        if (participantError) throw participantError;
        setHistory(historyRows || []);
        setParticipants(participantRows || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const leaders = useMemo(() => {
    const byUser = new Map();
    participants.forEach((participant) => {
      const existing = byUser.get(participant.user_id) || {
        user_id: participant.user_id,
        name: participant.display_name,
        wins: 0,
        losses: 0,
        draws: 0,
        solved: 0,
        totalSolveSeconds: 0,
        matches: 0,
        currentStreak: 0,
        rating: 1000,
      };
      const row = history.find((item) => item.clash_id === participant.clash_id && item.user_id === participant.user_id);
      const stats = participant.stats || {};
      if (row) {
        existing.matches += 1;
        existing.solved += stats.solved || 0;
        existing.totalSolveSeconds += stats.totalCompletionSeconds || 0;
        if (row.winner_name === "Draw") existing.draws += 1;
        else if (row.winner_name === participant.display_name) existing.wins += 1;
        else existing.losses += 1;
      }
      byUser.set(participant.user_id, existing);
    });

    return Array.from(byUser.values())
      .map((player) => {
        const winPercent = player.matches ? Math.round((player.wins / player.matches) * 100) : 0;
        const avgSolveTime = player.solved ? Math.round(player.totalSolveSeconds / player.solved) : 0;
        return {
          ...player,
          winPercent,
          avgSolveTime,
          currentStreak: calculateStreak(history, player.name),
          rating: 1000 + player.wins * 40 - player.losses * 20 + player.draws * 5,
        };
      })
      .sort((a, b) => b.rating - a.rating || b.wins - a.wins);
  }, [history, participants]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#111827_45%,#0f172a_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Navbar />
        <SharedHero
          eyebrow="Clash Leaderboard"
          title="Compare top Clash performers."
          description="Players are ranked by wins, consistency, speed, and rating from completed Clash matches."
        >
          <div className="flex flex-wrap gap-3">
            <Link to="/clash" className="rounded bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">Clash Home</Link>
            <Link to="/clash/history" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-gray-950 hover:bg-emerald-300">History</Link>
          </div>
        </SharedHero>

        {loading && <p className="mt-8 text-gray-300">Loading leaderboard...</p>}
        {error && <p className="mt-8 rounded bg-red-500/10 p-4 text-red-200">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-dark-layer-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Wins</th>
                  <th className="p-3">Losses</th>
                  <th className="p-3">Win %</th>
                  <th className="p-3">Avg Solve Time</th>
                  <th className="p-3">Streak</th>
                  <th className="p-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((player, index) => (
                  <tr key={player.user_id} className="border-t border-white/10 text-gray-300">
                    <td className="p-3 text-white">#{index + 1}</td>
                    <td className="p-3 font-semibold text-white">{player.name}</td>
                    <td className="p-3">{player.wins}</td>
                    <td className="p-3">{player.losses}</td>
                    <td className="p-3">{player.winPercent}%</td>
                    <td className="p-3">{formatDuration(player.avgSolveTime)}</td>
                    <td className="p-3">{player.currentStreak}</td>
                    <td className="p-3 text-emerald-300">{player.rating}</td>
                  </tr>
                ))}
                {leaders.length === 0 && <tr><td className="p-6 text-center text-gray-400" colSpan="8">No Clash leaderboard data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {authModal.isOpen && <AuthModal />}
    </div>
  );
}

function calculateStreak(history, name) {
  const ordered = history
    .filter((row) => row.winner_name === name || row.opponent_name === name || row.summary?.players?.some((player) => player.display_name === name))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  let streak = 0;
  for (const row of ordered) {
    if (row.winner_name === name) streak += 1;
    else break;
  }
  return streak;
}
