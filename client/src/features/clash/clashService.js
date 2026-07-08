import { supabase } from "../../supabase/supabase";
import { clashProblemBank, normalizeProblemForClash } from "./clashProblemBank";

export const CLASH_DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
export const CLASH_QUESTION_COUNTS = [1, 3, 5];
export const CLASH_TIME_LIMITS = [2, 5, 15, 30, 45, 60];
export const MAX_CLASH_PARTICIPANTS = 30;
export const CLASH_POINTS = { Easy: 30, Medium: 50, Hard: 60 };

export const emptyStats = () => ({
  solved: 0,
  submissions: 0,
  accepted: 0,
  wrongAttempts: 0,
  hintsUsed: 0,
  totalCompletionSeconds: 0,
  solvedProblemIds: [],
  solveTimes: {},
  solvedAt: {},
  points: 0,
  languages: [],
  fastestSolveSeconds: null,
  slowestSolveSeconds: null,
  runtime: {
    submissions: [],
    bestExecutionTime: null,
    lastExecutionTime: null,
    lastMemory: null,
  },
});

export const generateClashId = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const getDisplayName = (user) =>
  user?.user_metadata?.displayName || user?.user_metadata?.name || user?.email?.split("@")[0] || "Player";

export const getInviteLink = (clashId) => `${window.location.origin}/clash/${clashId}`;
export const getProblemId = (problem) => problem?.id || problem?.question_id;

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function fetchProblemsForClash(difficulty, questionCount) {
  const preferredCandidates = difficulty === "Mixed"
    ? clashProblemBank
    : clashProblemBank.filter((problem) => problem.difficulty === difficulty);
  const fallbackCandidates = difficulty === "Mixed"
    ? []
    : clashProblemBank.filter((problem) => problem.difficulty !== difficulty);
  const candidates = [...preferredCandidates, ...fallbackCandidates];
  const uniqueProblems = Array.from(new Map(candidates.map((problem) => [getProblemId(problem), problem])).values());
  if (uniqueProblems.length < questionCount) {
    throw new Error(`Only ${uniqueProblems.length} ${difficulty} problem(s) are available.`);
  }

  return uniqueProblems
    .map((problem) => ({ problem, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, questionCount)
    .map(({ problem }) => normalizeProblemForClash(problem));
}

export async function createClash({ difficulty, questionCount, timeLimit, user }) {
  const problems = await fetchProblemsForClash(difficulty, questionCount);
  const clashId = generateClashId();
  const now = new Date().toISOString();
  const baseStats = emptyStats();

  const matchPayload = {
    clash_id: clashId,
    creator_id: user.id,
    creator_email: user.email,
    difficulty,
    question_count: questionCount,
    time_limit_minutes: timeLimit,
    status: "waiting",
    problem_ids: problems.map((problem) => getProblemId(problem)),
    problem_snapshot: problems,
    ready_players: [],
    notifications: [{ type: "created", message: "Invitation created", at: now }],
    created_at: now,
    updated_at: now,
  };

  const { data: match, error: matchError } = await supabase
    .from("clash_matches")
    .insert(matchPayload)
    .select()
    .single();
  if (matchError) throw matchError;

  const { error: participantError } = await supabase.from("clash_participants").insert({
    clash_id: clashId,
    user_id: user.id,
    email: user.email,
    display_name: getDisplayName(user),
    role: "creator",
    ready: false,
    stats: baseStats,
    joined_at: now,
  });
  if (participantError) throw participantError;

  return match;
}

export async function fetchClash(clashId) {
  const { data: match, error: matchError } = await supabase
    .from("clash_matches")
    .select("*")
    .eq("clash_id", clashId)
    .single();
  if (matchError) throw matchError;

  const { data: participants, error: participantsError } = await supabase
    .from("clash_participants")
    .select("*")
    .eq("clash_id", clashId)
    .order("joined_at", { ascending: true });
  if (participantsError) throw participantsError;

  const { data: submissions, error: submissionsError } = await supabase
    .from("clash_submissions")
    .select("*")
    .eq("clash_id", clashId)
    .order("submitted_at", { ascending: false });
  if (submissionsError) throw submissionsError;

  return { match, participants: participants || [], submissions: submissions || [] };
}

export async function joinClash({ match, participants, user }) {
  const existing = participants.find((participant) => participant.user_id === user.id);
  if (existing) return existing;
  if (match.creator_id === user.id) throw new Error("You are already in this Clash as the creator.");
  if (participants.length >= MAX_CLASH_PARTICIPANTS) throw new Error(`This Clash already has ${MAX_CLASH_PARTICIPANTS} players.`);
  if (match.status !== "waiting") throw new Error("This Clash has already started or ended.");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("clash_participants")
    .insert({
      clash_id: match.clash_id,
      user_id: user.id,
      email: user.email,
      display_name: getDisplayName(user),
      role: "challenger",
      ready: false,
      stats: emptyStats(),
      joined_at: now,
    })
    .select()
    .single();
  if (error) {
    const duplicateJoin = error.code === "23505" || error.message?.toLowerCase().includes("duplicate key");
    if (!duplicateJoin) throw error;

    const { data: existingParticipant, error: existingError } = await supabase
      .from("clash_participants")
      .select("*")
      .eq("clash_id", match.clash_id)
      .eq("user_id", user.id)
      .single();
    if (existingError) throw existingError;
    return existingParticipant;
  }

  await appendNotification(match, "Opponent joined");
  return data;
}

export async function setReady({ clashId, userId, ready }) {
  const { data: match, error: matchError } = await supabase
    .from("clash_matches")
    .select("status")
    .eq("clash_id", clashId)
    .single();
  if (matchError) throw matchError;
  if (match.status !== "waiting" && ready === false) {
    throw new Error("Ready status is locked after the contest starts.");
  }

  const { error } = await supabase
    .from("clash_participants")
    .update({ ready })
    .eq("clash_id", clashId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function startClash(match, participants) {
  if (match.status !== "waiting") return;
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("clash_matches")
    .update({ status: "active", started_at: now, updated_at: now })
    .eq("clash_id", match.clash_id)
    .eq("status", "waiting");
  if (error) throw error;
  await appendNotification(match, "Match started");
}

export async function appendNotification(match, message) {
  const notifications = Array.isArray(match.notifications) ? match.notifications : [];
  const nextNotifications = [...notifications.slice(-20), { type: "clash", message, at: new Date().toISOString() }];
  await supabase
    .from("clash_matches")
    .update({ notifications: nextNotifications, updated_at: new Date().toISOString() })
    .eq("clash_id", match.clash_id);
}

export async function sendChatMessage({ match, participant, message }) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;
  const notifications = Array.isArray(match.notifications) ? match.notifications : [];
  const nextNotifications = [
    ...notifications.slice(-80),
    {
      type: "chat",
      userId: participant.user_id,
      displayName: participant.display_name,
      role: participant.role,
      message: cleanMessage.slice(0, 500),
      at: new Date().toISOString(),
    },
  ];
  const { error } = await supabase
    .from("clash_matches")
    .update({ notifications: nextNotifications, updated_at: new Date().toISOString() })
    .eq("clash_id", match.clash_id);
  if (error) throw error;
}

export async function exitClash({ match, participant, participants }) {
  if (!match || !participant) return;
  const activeContest = match.status === "active";

  if (activeContest) {
    const stats = { ...emptyStats(), ...(participant.stats || {}), leftAt: new Date().toISOString() };
    await supabase.from("clash_participants").update({ stats }).eq("id", participant.id);
    const nextParticipants = participants.map((player) => (player.id === participant.id ? { ...player, stats } : player));
    if (nextParticipants.every((player) => player.stats?.leftAt)) {
      await finishClash(match, nextParticipants);
    }
    return;
  }

  if (match.status === "waiting" && participant.role === "creator") {
    await supabase
      .from("clash_matches")
      .update({ status: "cancelled", ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("clash_id", match.clash_id);
  } else {
    await supabase.from("clash_participants").delete().eq("id", participant.id);
  }
}

export function secondsBetween(startDate, endDate = new Date()) {
  if (!startDate) return 0;
  return Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000));
}

export function formatDuration(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function getProblemTitle(problem) {
  return problem?.title || problem?.name || `Problem ${getProblemId(problem) || ""}`;
}

export function determineWinner(participants) {
  if (!participants.length) return { winner: null, isDraw: true };
  const ranked = [...participants].sort((a, b) => {
    const aStats = a.stats || emptyStats();
    const bStats = b.stats || emptyStats();
    return (
      (bStats.points || 0) - (aStats.points || 0) ||
      (bStats.solved || 0) - (aStats.solved || 0) ||
      (aStats.totalCompletionSeconds || 0) - (bStats.totalCompletionSeconds || 0) ||
      (aStats.wrongAttempts || 0) - (bStats.wrongAttempts || 0)
    );
  });
  const top = ranked[0];
  const second = ranked[1];
  if (!second) return { winner: top, isDraw: false };
  const topStats = top.stats || emptyStats();
  const secondStats = second.stats || emptyStats();
  const isDraw =
    (topStats.points || 0) === (secondStats.points || 0) &&
    (topStats.solved || 0) === (secondStats.solved || 0) &&
    (topStats.totalCompletionSeconds || 0) === (secondStats.totalCompletionSeconds || 0);
  return { winner: isDraw ? null : top, isDraw };
}

export function buildSummary(match, participants) {
  const { winner, isDraw } = determineWinner(participants);
  const players = participants.map((participant) => {
    const stats = participant.stats || emptyStats();
    const accuracy = stats.submissions ? Math.round(((stats.accepted || 0) / stats.submissions) * 100) : 0;
    return {
      ...participant,
      accuracy,
      averageSolveSeconds: stats.solved ? Math.round((stats.totalCompletionSeconds || 0) / stats.solved) : 0,
    };
  });

  const allSolveTimes = players.flatMap((player) => Object.values(player.stats?.solveTimes || {}));
  const fastestSolve = allSolveTimes.length ? Math.min(...allSolveTimes) : null;
  const slowestSolve = allSolveTimes.length ? Math.max(...allSolveTimes) : null;
  const difficultyBreakdown = (match.problem_snapshot || []).reduce((acc, problem) => {
    acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
    return acc;
  }, {});
  const problemResults = (match.problem_snapshot || []).map((problem) => {
    const problemId = getProblemId(problem);
    return {
      id: problemId,
      title: getProblemTitle(problem),
      difficulty: problem.difficulty,
      points: CLASH_POINTS[problem.difficulty] || 0,
      solvedBy: players
        .filter((player) => player.stats?.solvedProblemIds?.includes(problemId))
        .map((player) => ({
          userId: player.user_id,
          name: player.display_name,
          solvedAt: player.stats?.solvedAt?.[problemId] || null,
          solveSeconds: player.stats?.solveTimes?.[problemId] || null,
        }))
        .sort((a, b) => (a.solveSeconds ?? Infinity) - (b.solveSeconds ?? Infinity)),
    };
  });
  const leaderboard = [...players]
    .sort((a, b) => {
      const aStats = a.stats || emptyStats();
      const bStats = b.stats || emptyStats();
      return (
        (bStats.points || 0) - (aStats.points || 0) ||
        (bStats.solved || 0) - (aStats.solved || 0) ||
        (aStats.totalCompletionSeconds || 0) - (bStats.totalCompletionSeconds || 0)
      );
    })
    .map((player, index) => ({ rank: index + 1, ...player }));

  return {
    winner: isDraw ? "Draw" : winner?.display_name,
    players,
    leaderboard,
    problemResults,
    runtimeComparison: buildRuntimeComparison(players),
    fastestSolve,
    slowestSolve,
    difficultyBreakdown,
    insights: players.map((player) => {
      const stats = player.stats || emptyStats();
      const weakAccuracy = player.accuracy < 70;
      const slowAverage = player.averageSolveSeconds > match.time_limit_minutes * 30;
      return {
        userId: player.user_id,
        player: player.display_name,
        strengths: stats.solved ? "Converted problems under contest pressure." : "Stayed active and gathered attempts.",
        weaknesses: weakAccuracy ? "Accuracy dipped under pressure." : "Keep expanding coverage across topics.",
        speed: slowAverage ? "Spend time on faster pattern recognition." : "Solve pace was competitive.",
        accuracy: weakAccuracy ? "Review failed submissions before retrying." : "Submission accuracy was solid.",
        practice: "Practice the missed problem topics and repeat timed sets.",
        resources: "Use the Learn page for topic explanations and video resources.",
      };
    }),
  };
}

export function buildRuntimeComparison(participants) {
  const rows = participants
    .map((participant) => ({
      userId: participant.user_id,
      name: participant.display_name,
      executionTime: participant.stats?.runtime?.bestExecutionTime ?? null,
      memory: participant.stats?.runtime?.lastMemory ?? null,
    }))
    .sort((a, b) => {
      if (a.executionTime === null && b.executionTime === null) return a.name.localeCompare(b.name);
      if (a.executionTime === null) return 1;
      if (b.executionTime === null) return -1;
      return a.executionTime - b.executionTime;
    });

  return rows.map((row, index) => ({
    ...row,
    rank: row.executionTime === null ? null : index + 1,
    indication: row.executionTime === null ? "No runtime" : index === 0 ? "Faster" : "Slower",
  }));
}

export async function finishClash(match, participants) {
  if (match.status === "completed") return;
  const summary = buildSummary(match, participants);
  const endedAt = new Date().toISOString();
  const { winner, isDraw } = determineWinner(participants);

  await supabase
    .from("clash_matches")
    .update({ status: "completed", ended_at: endedAt, summary, updated_at: endedAt })
    .eq("clash_id", match.clash_id);

  await supabase.from("clash_results").upsert({
    clash_id: match.clash_id,
    winner_user_id: isDraw ? null : winner?.user_id,
    is_draw: isDraw,
    summary,
    created_at: endedAt,
  }, { onConflict: "clash_id" });

  const historyRows = participants.map((participant) => {
    const opponent = participants.find((p) => p.user_id !== participant.user_id);
    return {
      clash_id: match.clash_id,
      user_id: participant.user_id,
      opponent_name: opponent?.display_name || "Waiting player",
      winner_name: summary.winner,
      score: `${participant.stats?.solved || 0}/${match.question_count}`,
      duration_seconds: match.started_at ? secondsBetween(match.started_at, endedAt) : 0,
      summary,
      replay_details: {
        problems: match.problem_snapshot || [],
        participant: participant.display_name,
        leaderboard: summary.leaderboard || [],
        problemResults: summary.problemResults || [],
        personalInsight: (summary.insights || []).find((insight) => insight.userId === participant.user_id) || null,
      },
      created_at: endedAt,
    };
  });

  await supabase.from("clash_history").upsert(historyRows, { onConflict: "clash_id,user_id" });
  await appendNotification(match, "Match ended");
}

export async function recordSubmission({ match, participant, problem, language, accepted, result }) {
  const now = new Date().toISOString();
  const stats = { ...emptyStats(), ...(participant.stats || {}) };
  const problemId = getProblemId(problem);
  const alreadySolved = stats.solvedProblemIds.includes(problemId);

  stats.submissions += 1;
  if (accepted) stats.accepted += 1;
  if (!accepted) stats.wrongAttempts += 1;

  if (accepted && !alreadySolved) {
    const solveSeconds = secondsBetween(match.started_at, now);
    const points = CLASH_POINTS[problem.difficulty] || 0;
    stats.solved += 1;
    stats.points = (stats.points || 0) + points;
    stats.solvedProblemIds = [...stats.solvedProblemIds, problemId];
    stats.solveTimes = { ...stats.solveTimes, [problemId]: solveSeconds };
    stats.solvedAt = { ...(stats.solvedAt || {}), [problemId]: now };
    stats.totalCompletionSeconds += solveSeconds;
    stats.fastestSolveSeconds = stats.fastestSolveSeconds === null ? solveSeconds : Math.min(stats.fastestSolveSeconds, solveSeconds);
    stats.slowestSolveSeconds = stats.slowestSolveSeconds === null ? solveSeconds : Math.max(stats.slowestSolveSeconds, solveSeconds);
  }

  if (language?.name && !stats.languages.includes(language.name)) {
    stats.languages = [...stats.languages, language.name];
  }

  const executionTime = getTotalExecutionTime(result);
  const memoryUsage = getMaxMemoryUsage(result);
  stats.runtime = {
    ...(emptyStats().runtime),
    ...(stats.runtime || {}),
    submissions: [
      ...((stats.runtime || {}).submissions || []),
      {
        problemId,
        accepted,
        executionTime,
        memory: memoryUsage,
        submittedAt: now,
      },
    ].slice(-30),
    bestExecutionTime:
      executionTime === null
        ? stats.runtime?.bestExecutionTime ?? null
        : stats.runtime?.bestExecutionTime === null || stats.runtime?.bestExecutionTime === undefined
          ? executionTime
          : Math.min(stats.runtime.bestExecutionTime, executionTime),
    lastExecutionTime: executionTime,
    lastMemory: memoryUsage,
  };

  await supabase.from("clash_submissions").insert({
    clash_id: match.clash_id,
    user_id: participant.user_id,
    problem_id: problemId,
    language: language?.name || "Unknown",
    status: accepted ? "Accepted" : result?.description || "Wrong Answer",
    accepted,
    submitted_at: now,
  });

  const { data, error } = await supabase
    .from("clash_participants")
    .update({ stats })
    .eq("id", participant.id)
    .select()
    .single();
  if (error) throw error;

  await appendNotification(match, `${participant.display_name} submitted ${getProblemTitle(problem)}`);
  return data;
}

export function getTotalExecutionTime(result) {
  const times = (result?.results || [])
    .map((item) => Number(item.time))
    .filter((value) => Number.isFinite(value));
  if (!times.length) return null;
  return Number(times.reduce((sum, value) => sum + value, 0).toFixed(3));
}

export function getMaxMemoryUsage(result) {
  const memories = (result?.results || [])
    .map((item) => Number(item.memory))
    .filter((value) => Number.isFinite(value));
  if (!memories.length) return null;
  return Math.max(...memories);
}
