import Image from "next/image";
import { partners, stats, teamMembers } from "../data/siteData";

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

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="lg:w-1/2">
              <p className="section-label">About SysNet</p>
              <h2 className="mb-4 text-4xl font-bold text-slate-900">Who We Are</h2>
              <p className="mb-6 text-base leading-8 text-slate-700">
                SysNet Technologies is a leading provider of IT solutions, offering a wide range of services to help businesses succeed in the digital world. We are a team of passionate and experienced professionals who are dedicated to providing our clients with the best possible service.
              </p>

              <h3 className="mb-3 text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="mb-6 text-base leading-8 text-slate-700">
                To be the most trusted and respected IT solutions provider in the region.
              </p>

              <h3 className="mb-3 text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-base leading-8 text-slate-700">
                To help our clients achieve their business goals through the strategic use of technology.
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
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Our Core Values</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
                <h3 className="mb-2 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Meet Our Team</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="relative h-80">
                  <Image src={member.image} alt={member.name} fill className="object-contain" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                  <p className="mt-2 text-slate-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Our Stats</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
                <h3 className="text-3xl font-bold text-blue-700">{stat.value}+</h3>
                <p className="mt-2 text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Our Partners</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
            {partners.map((partner) => (
              <div key={partner.name} className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="relative h-16 w-full rounded-lg bg-cover bg-center bg-no-repeat grayscale" style={{ backgroundImage: `url('${partner.logo}')` }} title={partner.name} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}