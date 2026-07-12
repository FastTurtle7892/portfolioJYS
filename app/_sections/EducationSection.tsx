import EducationCard from "@/_components/EducationCard";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";

async function getEducations() {
  const response = await prisma.education.findMany({
    orderBy: { id: "asc" },
  });
  return response;
}

const Divider = () => (
  <div className="w-full max-w-[600px] h-[1px] mx-auto my-3 md:my-5 bg-gradient-to-r from-foreground/0 via-foreground/15 to-foreground/0" />
);

export default async function EducationSection() {
  const data = await getEducations();

  const educations = data.filter(d => d.category === "EDUCATION");
  const certifications = data.filter(d => d.category === "CERTIFICATION");
  const publications = data.filter(d => d.category === "PUBLICATION");
  const trainings = data.filter(d => d.category === "TRAINING");

  return (
    <section id="education">
      <SlideUpInView>
        <h2 className="section-eyebrow mb-6 md:mb-8">교육 · 자격 · 논문</h2>

        <div className="flex flex-col gap-8 md:gap-10">
          {educations.map(data => (
            <EducationCard key={`edu-card-${data.id}`} {...data} />
          ))}

          <Divider />

          <div className="flex flex-col md:flex-row gap-8 md:gap-6 lg:gap-10">
            <div className="flex-1 flex flex-col gap-6 md:gap-8">
              <h3 className="text-sm font-semibold text-foreground/50 hidden md:block">어학 · 자격증</h3>
              {certifications.map(data => (
                <EducationCard key={`edu-card-${data.id}`} {...data} />
              ))}
            </div>

            <div className="hidden md:block w-[1px] bg-gradient-to-b from-foreground/0 via-foreground/30 to-foreground/0" />
            <div className="md:hidden w-full h-[1px] bg-gradient-to-r from-foreground/0 via-foreground/30 to-foreground/0" />

            <div className="flex-1 flex flex-col gap-6 md:gap-8">
              <h3 className="text-sm font-semibold text-foreground/50">논문</h3>
              {publications.map(data => (
                <EducationCard key={`edu-card-${data.id}`} {...data} />
              ))}
            </div>
          </div>

          {trainings.length > 0 && (
            <>
              <Divider />
              {trainings.map(data => (
                <EducationCard key={`edu-card-${data.id}`} {...data} />
              ))}
            </>
          )}
        </div>
      </SlideUpInView>
    </section>
  );
}
