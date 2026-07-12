import Header from "@/_components/Header";
import EducationSection from "@/_sections/EducationSection";
import ExperienceSection from "@/_sections/ExperienceSection";
import IntroSection from "@/_sections/IntroSection";
import MainSection from "@/_sections/MainSection";
import OutroSection from "@/_sections/OutroSection";
import ProjectSection from "@/_sections/ProjectSection";
import SkillSection from "@/_sections/SkillSection";

import { SectionWatchProvider } from "./_components/SectionWatcher";

export default function Home() {
  return (
    <SectionWatchProvider>
      <Header />
      <main
        className="
        w-full min-w-96 max-w-screen-lg min-h-screen mx-auto
        px-5 md:px-8 lg:px-10 pt-16 md:pt-20
        flex flex-col items-center relative
      "
      >
        <MainSection />
        <IntroSection />
        <SkillSection />
        <ExperienceSection />
        <ProjectSection />
        <EducationSection />
        <OutroSection />
      </main>
    </SectionWatchProvider>
  );
}
