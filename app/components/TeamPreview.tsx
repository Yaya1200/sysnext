import Link from "next/link";

const teamMembers = [
  {
    name: "Bereket Kahsay",
    role: "General Manager",
    image: "/images/team/team1.png",
  },
  {
    name: "Frehiwot Endalkachew",
    role: "Co-Founder and Marketing Manager",
    image: "/images/team/team2.jpg",
  },
  {
    name: "Nahom Berhanu",
    role: "Web Developer",
    image: "/images/team/team3.jpg",
  },
  {
    name: "Kirubel E.",
    role: "Support Specialist",
    image: "/images/team/team4.jpg",
  },
];

export default function TeamPreview() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="section-label">Our Team</p>
          <h2 className="section-title">From the smallest unit to leadership, we work as one team.</h2>
          <p className="section-copy mx-auto mt-4 max-w-3xl">
            We cultivate leaders, share expertise, and build a supportive environment where people can do their best work.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="soft-card overflow-hidden text-center">
              <div
                className="h-80 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${member.image}')` }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="mt-2 text-base text-slate-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/about" className="primary-btn">
            More About Us
          </Link>
        </div>
      </div>
    </section>
  );
}