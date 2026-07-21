import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AiOutlineCopy,
  AiOutlineLoading3Quarters,
  AiOutlineLogout,
  AiOutlinePlayCircle,
  AiOutlineSend,
  AiOutlineShareAlt,
  AiOutlineThunderbolt,
} from "react-icons/ai";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import SharedHero from "../../components/SharedHero";
import { supabase } from "../../supabase/supabase";
import { apiUrl } from "../../config";
import { getDefaultLanguage, limitSupportedLanguages } from "../../constants/languages";
import ClashSummary from "../../features/clash/ClashSummary";
import {
  MAX_CLASH_PARTICIPANTS,
  exitClash,
  fetchClash,
  finishClash,
  formatDuration,
  getCurrentUser,
  getInviteLink,
  getMaxMemoryUsage,
  getProblemId,
  getProblemTitle,
  getTotalExecutionTime,
  buildRuntimeComparison,
  joinClash,
  recordSubmission,
  secondsBetween,
  sendChatMessage,
  startClash,
} from "../../features/clash/clashService";

export default function ClashRoom() {
  const { clashId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [code, setCode] = useState("");
  const [resultMessage, setResultMessage] = useState("Run sample tests before submitting.");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [runResults, setRunResults] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [now, setNow] = useState(Date.now());

  const me = useMemo(() => participants.find((participant) => participant.user_id === user?.id), [participants, user]);
  const problems = match?.problem_snapshot || [];
  const currentProblem = problems[activeProblemIndex];
  const solvedProblemIds = me?.stats?.solvedProblemIds || [];
  const editorLanguage = getEditorLanguage(selectedLanguage);
  const isCreator = me?.role === "creator";
  const contestActive = match?.status === "active";
  const chatMessages = useMemo(
    () => (match?.notifications || []).filter((notice) => notice.type === "chat"),
    [match]
  );
  const feedMessages = useMemo(
    () => (match?.notifications || []).filter((notice) => notice.type !== "chat"),
    [match]
  );
  const runtimeRows = useMemo(() => buildRuntimeComparison(participants), [participants]);
  const remainingSeconds = useMemo(() => {
    if (!match?.started_at) return (match?.time_limit_minutes || 0) * 60;
    return Math.max(0, match.time_limit_minutes * 60 - secondsBetween(match.started_at, new Date(now)));
  }, [match, now]);

  const loadClash = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) {
        setError("Please sign in before joining this Clash.");
        setLoading(false);
        return;
      }

      const loaded = await fetchClash(clashId);
      let loadedParticipants = loaded.participants;
      if (!loadedParticipants.some((participant) => participant.user_id === currentUser.id)) {
        await joinClash({ match: loaded.match, participants: loadedParticipants, user: currentUser });
        const refreshed = await fetchClash(clashId);
        loadedParticipants = refreshed.participants;
        loaded.match = refreshed.match;
        loaded.submissions = refreshed.submissions;
      }

      setMatch(loaded.match);
      setParticipants(loadedParticipants);
      setSubmissions(loaded.submissions);
    } catch (loadError) {
      setError(loadError.message || "This invite link is invalid or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clashId]);

  useEffect(() => {
    fetch(apiUrl("/languages/"))
      .then((response) => response.json())
      .then((data) => {
        const nextLanguages = limitSupportedLanguages(data);
        const defaultLanguage = getDefaultLanguage(nextLanguages);
        setLanguages(nextLanguages);
        setSelectedLanguage(defaultLanguage);
      })
      .catch(() => {
        const nextLanguages = limitSupportedLanguages([]);
        setLanguages(nextLanguages);
        setSelectedLanguage(getDefaultLanguage(nextLanguages));
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`clash-${clashId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "clash_matches", filter: `clash_id=eq.${clashId}` }, loadClash)
      .on("postgres_changes", { event: "*", schema: "public", table: "clash_participants", filter: `clash_id=eq.${clashId}` }, loadClash)
      .on("postgres_changes", { event: "*", schema: "public", table: "clash_submissions", filter: `clash_id=eq.${clashId}` }, loadClash)
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clashId, user?.id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (match?.status === "active" && remainingSeconds === 0) {
      finishClash(match, participants).catch((finishError) => console.error(finishError));
    }
  }, [match, participants, remainingSeconds]);

  useEffect(() => {
    if (!currentProblem) return;
    setCode(getStarterCode(currentProblem, selectedLanguage));
    setRunResults([]);
    setResultMessage("Run sample tests before submitting.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProblemId(currentProblem), selectedLanguage?.id]);

  const handleStart = async () => {
    if (!match || !isCreator || match.status !== "waiting") return;
    try {
      await startClash(match, participants);
      toast.success("Contest started", { theme: "dark" });
    } catch (startError) {
      toast.error(startError.message || "Could not start contest", { theme: "dark" });
    }
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(getInviteLink(clashId));
    toast.success("Invite link copied", { theme: "dark" });
  };

  const handleShareInvite = async () => {
    const inviteLink = getInviteLink(clashId);
    if (navigator.share) {
      await navigator.share({
        title: "Code Clash invite",
        text: "Join my Code Clash battle.",
        url: inviteLink,
      });
      return;
    }
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied", { theme: "dark" });
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("selected_language", JSON.stringify(language));
    if (currentProblem) setCode(getStarterCode(currentProblem, language));
    setLanguageMenuOpen(false);
  };

  const compileCurrentCode = async () => {
    if (!contestActive) throw new Error("Problems unlock when the contest starts.");
    if (!currentProblem) throw new Error("Problem is not ready yet.");
    if (!selectedLanguage?.id) throw new Error("Choose a language first.");
    const response = await fetch(apiUrl("/compile/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: selectedLanguage.id,
        testcases: currentProblem.testcases || [],
      }),
    });
    if (!response.ok) throw new Error("Judge0 evaluation failed.");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  };

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    try {
      const result = await compileCurrentCode();
      setRunResults(result.results || []);
      const passed = (result.results || []).filter((item) => item.status?.id === 3).length;
      setResultMessage(`${passed}/${result.results?.length || 0} sample test cases passed.`);
    } catch (runError) {
      toast.error(runError.message || "Run failed", { theme: "dark" });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem || !me || submitting || match.status !== "active") return;
    setSubmitting(true);
    try {
      const result = await compileCurrentCode();
      setRunResults(result.results || []);
      const accepted = result.status === 3;
      const executionTime = getTotalExecutionTime(result);
      const memory = getMaxMemoryUsage(result);
      setResultMessage(
        `${result.description || (accepted ? "Accepted" : "Wrong Answer")}${executionTime !== null ? ` in ${executionTime}s` : ""}`
      );
      await recordSubmission({ match, participant: me, problem: currentProblem, language: selectedLanguage, accepted, result });
      toast[accepted ? "success" : "error"](
        accepted ? `Accepted${executionTime !== null ? ` (${executionTime}s${memory ? `, ${memory} KB` : ""})` : ""}` : result.description || "Wrong Answer",
        { theme: "dark" }
      );
      if (accepted && activeProblemIndex < problems.length - 1) setActiveProblemIndex((index) => index + 1);
    } catch (submitError) {
      toast.error(submitError.message || "Submission failed", { theme: "dark" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = async (event) => {
    event.preventDefault();
    if (!match || !me || !chatDraft.trim()) return;
    const message = chatDraft;
    setChatDraft("");
    try {
      await sendChatMessage({ match, participant: me, message });
    } catch (chatError) {
      setChatDraft(message);
      toast.error(chatError.message || "Message was not sent", { theme: "dark" });
    }
  };

  const handleExit = async () => {
    if (!window.confirm("Exit this contest? Your current contest session will close.")) return;
    try {
      await exitClash({ match, participant: me, participants });
      navigate(-1);
    } catch (exitError) {
      toast.error(exitError.message || "Could not exit contest", { theme: "dark" });
    }
  };

  if (loading) {
    return <Shell><div className="p-8 text-white">Loading Clash...</div></Shell>;
  }

  if (error || match?.status === "cancelled") {
    return <Shell><div className="max-w-3xl mx-auto p-8 text-white"><h1 className="text-3xl font-bold">Clash unavailable</h1><p className="mt-3 text-gray-300">{error || "This Clash was cancelled."}</p><button onClick={() => navigate("/")} className="mt-5 rounded bg-white px-4 py-2 text-gray-950">Go Home</button></div></Shell>;
  }

  if (match?.status === "completed") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#111827_45%,#0f172a_100%)] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Navbar />
          <SharedHero
            eyebrow="Clash Results"
            title="Final leaderboard and solve timeline."
            description="Review the winner, points, accepted solves, timestamps, runtime comparison, and your personal contest insight."
          >
            <div className="flex flex-wrap gap-3">
              <Link to="/clash/history" className="rounded bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">History</Link>
              <Link to="/clash/leaderboard" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-gray-950 hover:bg-emerald-300">Leaderboard</Link>
              <Link to="/clash" className="rounded bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">New Clash</Link>
            </div>
          </SharedHero>
          <ClashSummary summary={match.summary} questionCount={match.question_count} currentUserId={user?.id} />
        </div>
      </div>
    );
  }

  return (
    <Shell hideTopbar>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_340px] gap-4 p-4 text-white">
        <aside className="rounded-lg border border-white/10 bg-dark-layer-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">Clash ID</p>
              <h1 className="text-xl font-bold">{clashId}</h1>
              <p className="mt-1 text-xs text-gray-500">{participants.length}/{MAX_CLASH_PARTICIPANTS} players joined</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyInvite} className="rounded bg-white/10 p-2 hover:bg-white/20" title="Copy invite link"><AiOutlineCopy /></button>
              <button onClick={handleShareInvite} className="rounded bg-white/10 p-2 hover:bg-white/20" title="Share invite link"><AiOutlineShareAlt /></button>
              <button onClick={handleExit} className="rounded bg-red-500/20 p-2 text-red-200 hover:bg-red-500/30" title="Exit Contest"><AiOutlineLogout /></button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Status" value={match.status} />
            <Stat label="Timer" value={formatDuration(remainingSeconds)} />
            <Stat label="Problems" value={`${activeProblemIndex + 1}/${match.question_count}`} />
            <Stat label="Difficulty" value={match.difficulty} />
          </div>

          {match.status === "waiting" && isCreator && (
            <button
              onClick={handleStart}
              className="mt-5 w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-emerald-400 px-4 py-3 font-semibold text-white transition hover:brightness-110"
            >
              Start Contest
            </button>
          )}

          {match.status === "waiting" && !isCreator && (
            <div className="mt-5 rounded-lg bg-white/5 p-4 text-sm text-gray-300">
              Waiting for the creator to start. Problems unlock with the timer.
            </div>
          )}

          <div className="mt-5">
            <h2 className="font-semibold">Participants</h2>
            <div className="mt-3 max-h-[48vh] space-y-3 overflow-auto pr-1">
              {participants.map((participant) => (
                <Player key={participant.id} participant={participant} isMe={participant.user_id === user?.id} total={match.question_count} />
              ))}
              {participants.length < 2 && <div className="rounded bg-white/5 p-3 text-sm text-gray-400">Only one player is here. The creator can still start.</div>}
            </div>
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-dark-layer-1 overflow-hidden">
          {!contestActive ? (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Locked Lobby</p>
              <h2 className="mt-3 text-3xl font-bold">Problems unlock when the timer starts.</h2>
              <p className="mt-3 max-w-xl text-gray-300">
                The creator controls the start. Until then, nobody can see the problem set or submit code.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <Stat label="Players" value={participants.length} />
                <Stat label="Problems" value={match.question_count} />
                <Stat label="Timer" value={formatDuration((match.time_limit_minutes || 0) * 60)} />
              </div>
            </div>
          ) : (
          <>
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <p className="text-sm text-emerald-300">Problem {activeProblemIndex + 1}</p>
                <h2 className="text-2xl font-bold">{getProblemTitle(currentProblem)}</h2>
                <p className="mt-1 text-sm text-gray-400">{currentProblem?.topics}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {problems.map((problem, index) => (
                  <button key={getProblemId(problem)} onClick={() => setActiveProblemIndex(index)} className={`rounded px-3 py-2 text-sm ${index === activeProblemIndex ? "bg-emerald-400 text-gray-950" : solvedProblemIds.includes(getProblemId(problem)) ? "bg-emerald-900 text-emerald-100" : "bg-white/10 text-gray-300"}`}>{index + 1}</button>
                ))}
              </div>
            </div>
            <ProblemStatement problem={currentProblem} />
          </div>

          <div className="flex flex-col gap-3 border-b border-white/10 bg-gray-950/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <LanguageSelector
              languages={languages}
              selectedLanguage={selectedLanguage}
              menuOpen={languageMenuOpen}
              onToggle={() => setLanguageMenuOpen((open) => !open)}
              onSelect={handleLanguageSelect}
            />
            <span className="rounded bg-emerald-400 px-3 py-1 text-sm font-semibold text-gray-950">{selectedLanguage?.name || "No language selected"}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 bg-gray-950/60 px-4 py-2">
            <p className="text-sm text-gray-300">Code editor</p>
            <button
              type="button"
              onClick={() => setEditorExpanded((expanded) => !expanded)}
              className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
            >
              {editorExpanded ? "Show Results" : "Expand Editor"}
            </button>
          </div>
          <Editor height={editorExpanded ? "68vh" : "42vh"} theme="vs-dark" language={editorLanguage} value={code} onChange={(value) => setCode(value || "")} options={{ fontSize: 15, minimap: { enabled: false }, scrollBeyondLastLine: false }} />

          <div className="border-t border-white/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-300">{resultMessage}</p>
              <div className="flex gap-2">
                <button disabled={running || !selectedLanguage} onClick={handleRun} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-5 py-2 font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50">
                  {running ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlinePlayCircle />}
                  Run
                </button>
                <button disabled={submitting || match.status !== "active"} onClick={handleSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-dark-green-s px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineThunderbolt />}
                  Submit
                </button>
              </div>
            </div>
            <TestCaseResults testcases={currentProblem?.testcases || []} results={runResults} />
          </div>
          </>
          )}
        </main>

        <aside className="space-y-4">
          <section className="rounded-lg border border-white/10 bg-dark-layer-1 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Runtime Race</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {runtimeRows.map((row, index) => (
                <div key={row.userId} className="rounded bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{row.rank || "-"}. {row.name}</p>
                    <span className={row.rank === 1 ? "text-emerald-300" : "text-amber-200"}>{row.indication}</span>
                  </div>
                  <p className="mt-1 text-gray-300">Time: {formatRuntime(row.executionTime)}</p>
                  <p className="text-gray-400">Memory: {formatMemory(row.memory)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-dark-layer-1 p-4">
            <h2 className="text-lg font-bold">Live Chat</h2>
            <div className="mt-3 flex h-56 flex-col gap-2 overflow-auto rounded bg-white/5 p-3 text-sm">
              {chatMessages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
              {chatMessages.slice(-40).map((message, index) => (
                <div key={`${message.at}-${index}`} className={message.userId === user?.id ? "text-right" : ""}>
                  <p className="text-xs text-gray-500">
                    {message.displayName}
                    {message.role === "creator" && <span className="ml-1 rounded bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-gray-950">creator</span>}
                  </p>
                  <p className={`inline-block max-w-[90%] rounded px-3 py-2 ${message.userId === user?.id ? "bg-emerald-400 text-gray-950" : "bg-white/10 text-gray-100"}`}>{message.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
              <input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} maxLength={500} placeholder="Message participants" className="min-w-0 flex-1 rounded border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-300" />
              <button className="rounded bg-emerald-400 px-3 text-gray-950" title="Send message"><AiOutlineSend /></button>
            </form>
          </section>

          <section className="rounded-lg border border-white/10 bg-dark-layer-1 p-4">
            <h2 className="text-lg font-bold">Live Feed</h2>
            <div className="mt-4 max-h-44 space-y-3 overflow-auto">
              {feedMessages.slice(-8).reverse().map((notice, index) => (
                <div key={`${notice.at}-${index}`} className="rounded bg-white/5 p-3 text-sm text-gray-300">
                  <p>{notice.message}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(notice.at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <h3 className="font-semibold">Submissions</h3>
              <div className="mt-3 space-y-2 text-sm text-gray-300">
                {submissions.slice(0, 8).map((submission) => (
                  <div key={submission.id} className="rounded bg-white/5 p-2">
                    <p>{participants.find((p) => p.user_id === submission.user_id)?.display_name || "Player"}</p>
                    <p className={submission.accepted ? "text-emerald-300" : "text-red-300"}>{submission.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

function getEditorLanguage(language) {
  const name = language?.name?.toLowerCase() || "";
  if (name.includes("python")) return "python";
  if (name.includes("java") && !name.includes("javascript")) return "java";
  if (name.includes("c++") || name.includes("cpp")) return "cpp";
  if (name.includes("c#")) return "csharp";
  return "javascript";
}

function getStarterCode(problem, language) {
  const editorLanguage = getEditorLanguage(language);
  return problem?.starterCode?.[editorLanguage] || problem?.starterCode?.javascript || "// Write your solution here";
}

function Shell({ children, hideTopbar = false }) {
  return <div className="min-h-screen bg-dark-layer-2">{!hideTopbar && <Topbar />}{children}</div>;
}

function LanguageSelector({ languages, selectedLanguage, menuOpen, onToggle, onSelect }) {
  return (
    <div className="relative min-w-[260px] text-sm">
      <p className="mb-1 text-gray-300">Language</p>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-300 px-3 py-2 font-semibold text-gray-950 shadow-lg shadow-emerald-950/30 outline-none ring-2 ring-emerald-500/40 transition hover:bg-emerald-200 focus:border-white focus:ring-white/70"
      >
        <span className="truncate">{selectedLanguage?.name || "Select language"}</span>
        <span className="ml-3 text-xs">{menuOpen ? "^" : "v"}</span>
      </button>
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-auto rounded-lg border border-white/10 bg-gray-950 p-2 shadow-2xl">
          {languages.map((language) => {
            const selected = language.id === selectedLanguage?.id;
            return (
              <button
                key={language.id}
                type="button"
                onClick={() => onSelect(language)}
                className={`mb-1 flex w-full items-center justify-between rounded px-3 py-2 text-left transition last:mb-0 ${
                  selected
                    ? "bg-emerald-400 font-bold text-gray-950 ring-2 ring-white/70"
                    : "bg-transparent text-gray-100 hover:bg-white/10"
                }`}
              >
                <span className="truncate">{language.name}</span>
                {selected && <span className="ml-3 rounded bg-gray-950 px-2 py-0.5 text-xs text-emerald-200">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProblemStatement({ problem }) {
  if (!problem) return null;
  return (
    <div className="mt-4 max-h-72 overflow-auto rounded bg-white/5 p-4 text-sm text-gray-300">
      <Section title="Statement" text={problem.description || "Problem statement unavailable."} />
      <Section title="Input Format" text={problem.inputFormat} />
      <Section title="Output Format" text={problem.outputFormat} />
      <Section title="Constraints" text={problem.constraints} />
      <Section title="Explanation" text={problem.explanation} />
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {(problem.testcases || []).map((testcase, index) => (
          <div key={index} className="rounded border border-white/10 bg-gray-950/60 p-3">
            <p className="font-semibold text-white">Sample {index + 1}</p>
            <CodeBlock label="Input" value={testcase.input.join("\n")} />
            <CodeBlock label="Output" value={testcase.output.join("\n")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <div className="mt-3 first:mt-0">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

function CodeBlock({ label, value }) {
  return (
    <div className="mt-2">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <pre className="mt-1 overflow-auto rounded bg-black/40 p-2 text-xs text-gray-100">{value}</pre>
    </div>
  );
}

function TestCaseResults({ testcases, results }) {
  return (
    <div className="mt-4 space-y-3">
      {testcases.map((testcase, index) => {
        const result = results[index];
        const passed = result?.status?.id === 3;
        return (
          <div key={index} className="rounded border border-white/10 bg-white/5 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Test Case {index + 1}</p>
              <span className={`rounded px-2 py-1 text-xs ${!result ? "bg-white/10 text-gray-300" : passed ? "bg-emerald-400 text-gray-950" : "bg-red-500/20 text-red-200"}`}>
                {!result ? "Not run" : passed ? "Pass" : result.status?.description || "Fail"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <CodeBlock label="Input" value={testcase.input.join("\n")} />
              <CodeBlock label="Expected Output" value={testcase.output.join("\n")} />
              <CodeBlock label="User Output" value={(result?.actual_output || []).join("\n") || result?.error || ""} />
            </div>
            {result && <p className="mt-2 text-xs text-gray-400">Time: {formatRuntime(result.time)} | Memory: {formatMemory(result.memory)}</p>}
          </div>
        );
      })}
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

function Stat({ label, value }) {
  return <div className="rounded bg-white/5 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold capitalize">{value}</p></div>;
}

function Player({ participant, isMe, total }) {
  const stats = participant.stats || {};
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-semibold">{participant.display_name}{isMe ? " (You)" : ""}</p>
        <span className={`shrink-0 rounded px-2 py-1 text-xs ${participant.stats?.leftAt ? "bg-red-500/20 text-red-200" : "bg-emerald-500 text-gray-950"}`}>
          {participant.stats?.leftAt ? "Left" : "Joined"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="Solved" value={`${stats.solved || 0}/${total}`} />
        <Stat label="Points" value={stats.points || 0} />
        <Stat label="Submits" value={stats.submissions || 0} />
      </div>
    </div>
  );
}
