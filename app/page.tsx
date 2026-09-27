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
        w-full min-w-96 max-w-[1440px] min-h-screen mx-auto
        px-5 md:px-8 lg:px-10 pt-16 md:pt-20
        flex flex-col items-center relative
      "
      >
        {/* SSAFY 프로젝트 카드 4개를 한 줄로 배치하기 위해 main 자체는 넓혔지만,
            나머지 섹션들은 예전과 동일한 폭(max-w-screen-lg)으로 다시 감싸서
            시각적으로 이전과 똑같이 보이게 한다. ProjectSection만 이 감싸개 밖에 둬서
            내부에서 랩 카드(좁게)와 SSAFY 카드(넓게)를 따로 처리한다. */}
        <div className="w-full max-w-screen-lg mx-auto flex flex-col items-center">
          <MainSection />
          <IntroSection />
          <SkillSection />
          <ExperienceSection />
        </div>
        <ProjectSection />
        <div className="w-full max-w-screen-lg mx-auto flex flex-col items-center">
          <EducationSection />
          <OutroSection />
        </div>
      </main>
    </SectionWatchProvider>
  );
}
