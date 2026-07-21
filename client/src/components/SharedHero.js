import React from "react";

export default function SharedHero({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-8 shadow-[0_25px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:px-8 lg:px-10 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_45%)]" />
      <div className="relative">
        <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">{description}</p>
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
