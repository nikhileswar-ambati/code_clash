import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineCopy, AiOutlineLoading3Quarters, AiOutlineShareAlt, AiOutlineThunderbolt } from "react-icons/ai";
import {
  CLASH_DIFFICULTIES,
  CLASH_QUESTION_COUNTS,
  CLASH_TIME_LIMITS,
  createClash,
  getCurrentUser,
  getInviteLink,
} from "./clashService";

export default function ClashHomeSection({ onRequireAuth }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(1);
  const [timeLimit, setTimeLimit] = useState(5);
  const [inviteLink, setInviteLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = async () => {
    setCreating(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        onRequireAuth?.();
        return;
      }
      const match = await createClash({ difficulty, questionCount, timeLimit, user });
      const link = getInviteLink(match.clash_id);
      setInviteLink(link);
      toast.success("Clash created. Invite link is ready.", { theme: "dark" });
      navigate(`/clash/${match.clash_id}`);
    } catch (error) {
      toast.error(error.message || "Unable to create Clash", { theme: "dark" });
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied", { theme: "dark" });
  };


  const handleShare = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "Code Clash invite",
        text: "Join my Code Clash battle.",
        url: inviteLink,
      });
      return;
    }
    await handleCopy();
  };
  const handleJoin = (event) => {
    event?.preventDefault();
    const id = joinCode.trim().replace(/^.*\/clash\//, "");
    if (!id) {
      toast.error("Enter a Clash ID or invite link", { theme: "dark" });
      return;
    }
    navigate(`/clash/${id}`);
  };

  return (
    <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-6 items-stretch">
      <div className="rounded-lg border border-white/10 bg-dark-layer-1/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-r from-fuchsia-500 to-emerald-400 text-xl">
            <AiOutlineThunderbolt />
          </span>
          <div>
            <h2 className="text-3xl font-bold">Clash</h2>
            <p className="text-sm text-gray-300">Challenge your friends in real-time coding battles and discover who codes faster.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Control label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={CLASH_DIFFICULTIES} />
          <Control label="Questions" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} options={CLASH_QUESTION_COUNTS} />
          <Control label="Time Limit" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} options={CLASH_TIME_LIMITS} suffix=" minutes" />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-emerald-400 px-5 py-3 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineThunderbolt />}
            Create Clash
          </button>
          <button
            onClick={handleCopy}
            disabled={!inviteLink}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AiOutlineCopy />
            Copy Invite Link
          </button>
          <button
            onClick={handleShare}
            disabled={!inviteLink}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AiOutlineShareAlt />
            Share Link
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-dark-layer-1/90 p-6 text-white shadow-2xl">
        <h3 className="text-2xl font-bold">Join Clash</h3>
        <p className="mt-2 text-sm text-gray-300">Enter the Clash ID and jump straight into the contest room.</p>
        <form onSubmit={handleJoin} className="mt-5 flex flex-col gap-3">
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="abc123xyz"
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-emerald-300"
          />
          <button type="submit" className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-gray-950 transition hover:bg-emerald-300">
            Join Clash
          </button>
        </form>
      </div>
    </section>
  );
}

function Control({ label, value, onChange, options, suffix = "" }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-gray-300">
      {label}
      <select value={value} onChange={onChange} className="rounded-lg border border-white/10 bg-gray-950/70 px-3 py-3 text-white outline-none focus:border-fuchsia-300">
        {options.map((option) => (
          <option key={option} value={option}>{option}{typeof option === "number" ? suffix : ""}</option>
        ))}
      </select>
    </label>
  );
}
