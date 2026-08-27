import Image from "next/image";
import { partners as defaultPartners, stats, teamMembers as defaultTeam, PartnerItem, TeamMemberItem } from "../data/siteData";
import { createClient } from "../../lib/supabase/server";

const values = [
  {
    title: "Integrity",
    description: "We are honest and ethical in everything we do. We are committed to building trust with our clients and partners.",
  },
  {
    title: "Quality",
    description: "We are committed to providing our clients with the highest quality products and services. We are constantly striving to improve our processes and deliverables.",
  },
  {
    title: "Teamwork",
    description: "We believe that teamwork is essential to our success. We work together to achieve our common goals and support each other along the way.",
  },
  {
    title: "Growth and Profitability",
    description: "We are committed to sustainable growth and profitability. We are constantly looking for new opportunities to expand our business and create value for our stakeholders.",
  },
];

export default async function AboutPage() {
  let team: TeamMemberItem[] = defaultTeam;
  let partners: PartnerItem[] = defaultPartners;

  try {
    const supabase = await createClient();
    const [teamRes, partRes] = await Promise.all([
      supabase.from("content_items").select("*").eq("content_type", "team").order("id", { ascending: true }),
      supabase.from("content_items").select("*").eq("content_type", "partner").order("id", { ascending: true }),
    ]);

    if (teamRes.data && teamRes.data.length > 0) {
      team = teamRes.data.map((item) => ({
        id: item.id,
        name: item.title,
        role: item.subtitle || "Specialist",
        image: item.image || "/images/team/team1.png",
        bio: item.description || "",
      }));
    }

    if (partRes.data && partRes.data.length > 0) {
      partners = partRes.data.map((item) => ({
        id: item.id,
        name: item.title,
        logo: item.image || "/images/partners/partner1.jpg",
        website: item.extra_data?.website || "#",
      }));
    }
  } catch {
    // ignore
  }

  return (
    <div className="bg-white">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="lg:w-1/2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">About SysNet</p>
              <h2 className="mt-2 mb-4 text-4xl font-black text-slate-900">Who We Are</h2>
              <p className="mb-6 text-base leading-8 text-slate-700">
                SysNet Technologies is a leading provider of IT infrastructure, enterprise networking, and digital solutions. We are a team of passionate and certified professionals dedicated to providing our institutional and business clients with resilient technology foundations.
              </p>

              <h3 className="mb-2 text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="mb-6 text-base leading-8 text-slate-700">
                To be the most trusted and respected IT solutions and digital transformation partner in the region.
              </p>

              <h3 className="mb-2 text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-base leading-8 text-slate-700">
                To help organizations achieve their strategic goals through robust, secure, and modern technology infrastructure.
              </p>
            </div>

            <div className="mt-8 lg:mt-0 lg:w-1/2">
              <Image src="/images/about/about-1.jpg" alt="About SysNet" width={600} height={400} className="rounded-3xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-slate-900">Our Core Values</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <h3 className="mb-2 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-slate-900">Meet Our Team</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <div key={member.id || member.name} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 text-center">
                <div className="relative h-80 bg-slate-50">
                  <img src={member.image} alt={member.name} className="h-full w-full object-contain" />
                </div>
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
        </div>
      </section>

      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black">Our Milestone Achievements</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-slate-800/80 p-8 text-center border border-slate-700 shadow-sm">
                <h3 className="text-4xl font-black text-blue-400">{stat.value}+</h3>
                <p className="mt-2 text-sm font-medium text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-slate-900">Our Trusted Partners</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
            {partners.map((partner) => (
              <div key={partner.id || partner.name} className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <img src={partner.logo} alt={partner.name} className="max-h-16 max-w-full object-contain grayscale hover:grayscale-0 transition" title={partner.name} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}