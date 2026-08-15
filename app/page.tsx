import Hero from "./components/Hero";
import ServicesOverview from "./components/ServicesOverview";
import Stats from "./components/Stats";
import LatestProjects from "./components/LatestProjects";
import TeamPreview from "./components/TeamPreview";
import Partners from "./components/Partners";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <Stats />
      <LatestProjects />
      <TeamPreview />
      <Partners />
      <CTA />
    </>
  );
}
