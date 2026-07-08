import React from "react";
import { buildRuntimeComparison, formatDuration } from "./clashService";

export default function ClashSummary({ summary, questionCount, currentUserId }) {
  if (!summary) return null;
  const runtimeComparison = summary.runtimeComparison?.length
    ? summary.runtimeComparison
    : buildRuntimeComparison(summary.players || []);
  const insights = currentUserId
    ? (summary.insights || []).filter((insight) => insight.userId === currentUserId)
    : summary.insights || [];
  const leaderboard = summary.leaderboard?.length ? summary.leaderboard : summary.players || [];

  return (
    <div className="space-y-5 text-white">
      <div className="rounded-lg border border-white/10 bg-white/10 p-5">
        <p className="text-sm uppercase tracking-wide text-emerald-300">Winner</p>
        <h2 className="mt-1 text-3xl font-bold">{summary.winner}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.players?.map((player) => (
          <div key={player.user_id} className="rounded-lg border border-white/10 bg-dark-layer-1 p-5">
            <h3 className="text-xl font-semibold">{player.display_name}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
              <Metric label="Score" value={`${player.stats?.solved || 0}/${questionCount}`} />
              <Metric label="Points" value={player.stats?.points || 0} />
              <Metric label="Total Time" value={formatDuration(player.stats?.totalCompletionSeconds || 0)} />
              <Metric label="Accuracy" value={`${player.accuracy || 0}%`} />
              <Metric label="Avg / Problem" value={formatDuration(player.averageSolveSeconds || 0)} />
              <Metric label="Wrong Attempts" value={player.stats?.wrongAttempts || 0} />
              <Metric label="Hints Used" value={player.stats?.hintsUsed || 0} />
              <Metric label="Languages" value={(player.stats?.languages || []).join(", ") || "None"} wide />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-dark-layer-1 p-5">
        <h3 className="text-xl font-semibold">Leaderboard</h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm text-gray-300">
            <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Points</th>
                <th className="py-2 pr-3">Solved</th>
                <th className="py-2 pr-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={player.user_id} className="border-b border-white/5">
                  <td className="py-3 pr-3 font-semibold text-white">#{player.rank || index + 1}</td>
                  <td className="py-3 pr-3">{player.display_name}</td>
                  <td className="py-3 pr-3 text-emerald-300">{player.stats?.points || 0}</td>
                  <td className="py-3 pr-3">{player.stats?.solved || 0}/{questionCount}</td>
                  <td className="py-3 pr-3">{formatDuration(player.stats?.totalCompletionSeconds || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-dark-layer-1 p-5">
        <h3 className="text-xl font-semibold">Problem Results</h3>
        <div className="mt-4 space-y-3">
          {(summary.problemResults || []).map((problem) => (
            <div key={problem.id} className="rounded bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{problem.title}</p>
                  <p className="text-xs text-gray-500">{problem.difficulty} - {problem.points} points</p>
                </div>
                <span className="rounded bg-white/10 px-2 py-1 text-xs text-gray-300">{problem.solvedBy?.length || 0} solved</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-300">
                {problem.solvedBy?.length ? problem.solvedBy.map((solve) => (
                  <div key={`${problem.id}-${solve.userId}`} className="flex flex-wrap justify-between gap-2 rounded bg-black/20 px-3 py-2">
                    <span>{solve.name}</span>
                    <span>{solve.solvedAt ? new Date(solve.solvedAt).toLocaleString() : formatDuration(solve.solveSeconds || 0)}</span>
                  </div>
                )) : <p className="text-gray-500">No accepted solve.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/10 p-5">
        <h3 className="text-xl font-semibold">Performance Details</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
          <Metric label="Fastest Solve" value={summary.fastestSolve === null ? "None" : formatDuration(summary.fastestSolve)} />
          <Metric label="Slowest Solve" value={summary.slowestSolve === null ? "None" : formatDuration(summary.slowestSolve)} />
          <Metric label="Difficulty Breakdown" value={Object.entries(summary.difficultyBreakdown || {}).map(([key, value]) => `${key}: ${value}`).join(", ") || "None"} />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-dark-layer-1 p-5">
        <h3 className="text-xl font-semibold">Runtime Comparison</h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm text-gray-300">
            <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Execution Time</th>
                <th className="py-2 pr-3">Memory</th>
                <th className="py-2 pr-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {runtimeComparison.map((row, index) => (
                <tr key={row.userId || row.name} className="border-b border-white/5">
                  <td className="py-3 pr-3 font-semibold text-white">{row.rank || "-"}</td>
                  <td className="py-3 pr-3">{row.name}</td>
                  <td className="py-3 pr-3">{formatRuntime(row.executionTime)}</td>
                  <td className="py-3 pr-3">{formatMemory(row.memory)}</td>
                  <td className={index === 0 && row.rank ? "py-3 pr-3 text-emerald-300" : "py-3 pr-3 text-amber-200"}>{row.indication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div key={insight.player} className="rounded-lg border border-white/10 bg-dark-layer-1 p-5 text-sm text-gray-300">
            <h3 className="text-lg font-semibold text-white">AI Insights for {insight.player}</h3>
            <p className="mt-3"><span className="text-emerald-300">Strengths:</span> {insight.strengths}</p>
            <p className="mt-2"><span className="text-emerald-300">Weaknesses:</span> {insight.weaknesses}</p>
            <p className="mt-2"><span className="text-emerald-300">Speed:</span> {insight.speed}</p>
            <p className="mt-2"><span className="text-emerald-300">Accuracy:</span> {insight.accuracy}</p>
            <p className="mt-2"><span className="text-emerald-300">Practice:</span> {insight.practice}</p>
            <p className="mt-2"><span className="text-emerald-300">Resources:</span> {insight.resources}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRuntime(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(3)}s` : "N/A";
}

function formatMemory(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number} KB` : "N/A";
}

function Metric({ label, value, wide }) {
  return (
    <div className={wide ? "col-span-2 rounded bg-white/5 p-3" : "rounded bg-white/5 p-3"}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
