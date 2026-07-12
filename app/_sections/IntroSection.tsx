import FeatureItems from "@/_components/FeatureItems";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";

async function getIntro() {
  const response = await prisma.intro.findMany({ orderBy: { id: "asc" } });
  return response;
}

export default async function IntroSection() {
  const features = await getIntro();

  return (
    <section id="intro">
      <SlideUpInView>
        <p className="section-eyebrow">핵심 역량</p>
        <p className="section-title">신호를 읽고, 데이터를 잇고, 시스템으로 완성하는 3가지 역량</p>
        <FeatureItems features={features} />
      </SlideUpInView>
    </section>
  );
}
