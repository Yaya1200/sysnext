"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { teamMembers as defaultTeam, TeamMemberItem } from "../data/siteData";

export default function TeamPreview() {
  const [members, setMembers] = useState<TeamMemberItem[]>(defaultTeam);

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

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Our Team</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            From engineering to leadership, we work as one team.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            We cultivate certified engineers, share deep IT expertise, and deliver dedicated support across Ethiopia and East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <div
              key={member.id || member.name}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-center transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="h-80 bg-contain bg-center bg-no-repeat bg-white"
                style={{ backgroundImage: `url('${member.image}')` }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-blue-600">{member.role}</p>
                {member.bio && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">{member.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/about"
            className="rounded-full bg-slate-900 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            More About Our Team & History
          </Link>
        </div>
      </div>
    </section>
  );
}