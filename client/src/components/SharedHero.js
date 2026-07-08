import React from "react";

export default function SharedHero({ eyebrow, title, description, children }) {
  return (
    <section className="pt-8 pb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-gray-300">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
