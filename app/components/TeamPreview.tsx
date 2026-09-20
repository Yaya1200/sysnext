"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  teamMembers as defaultTeam,
  TeamMemberItem,
} from "../data/siteData";

export default function TeamPreview() {
  const [members, setMembers] = useState<TeamMemberItem[]>(defaultTeam);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/content?type=team")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(
            data.map((item: any) => ({
              id: item.id,
              name: item.title,
              role: item.subtitle || "Team Specialist",
              image: item.image || "/images/team/team1.png",
              bio: item.description || "",
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  // Automatically rotate through the team.
  useEffect(() => {
    if (members.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) => {
        const maxIndex = Math.max(0, members.length - 4);
        return previous >= maxIndex ? 0 : previous + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [members.length]);

  const visibleMembers =
    members.length <= 4
      ? members
      : members.slice(currentIndex, currentIndex + 4).length === 4
        ? members.slice(currentIndex, currentIndex + 4)
        : [
            ...members.slice(currentIndex),
            ...members.slice(0, 4 - (members.length - currentIndex)),
          ];

  const maxIndex = Math.max(0, members.length - 4);

  const goPrevious = () => {
    setCurrentIndex((previous) =>
      previous <= 0 ? maxIndex : previous - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((previous) =>
      previous >= maxIndex ? 0 : previous + 1
    );
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Our Team
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            From engineering to leadership, we work as one team.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            We cultivate certified engineers, share deep IT expertise, and
            deliver dedicated support across Ethiopia and East Africa.
          </p>
        </div>

        {/* Team carousel */}
        <div className="relative">
          {/* Previous button */}
          {members.length > 4 && (
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous team members"
              className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-lg transition hover:bg-blue-600 hover:text-white md:flex"
            >
              ←
            </button>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {visibleMembers.map((member) => (
              <div
                key={member.id || member.name}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Member image */}
                <div className="relative flex h-80 items-center justify-center overflow-hidden bg-white">
                  <Image
                    src={member.image || "/images/team/team1.png"}
                    alt={`${member.name} - ${member.role}`}
                    width={500}
                    height={500}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>

                {/* Member information */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {member.role}
                  </p>

                  {member.bio && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Next button */}
          {members.length > 4 && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next team members"
              className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-lg transition hover:bg-blue-600 hover:text-white md:flex"
            >
              →
            </button>
          )}
        </div>

        {/* Mobile navigation */}
        {members.length > 4 && (
          <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous team members"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:bg-blue-600 hover:text-white"
            >
              ←
            </button>

            <span className="text-xs font-semibold text-slate-500">
              {currentIndex + 1} / {maxIndex + 1}
            </span>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next team members"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:bg-blue-600 hover:text-white"
            >
              →
            </button>
          </div>
        )}

        {/* Desktop carousel indicators */}
        {members.length > 4 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show team members ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* More team link */}
        <div className="mt-12 text-center">
          <Link
            href="/about"
            className="inline-flex rounded-full bg-slate-900 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            Meet Our Team →
          </Link>
        </div>
      </div>
    </section>
  );
}

