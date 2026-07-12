import ProjectModal from "@/_components/project/ProjectModal";
import prisma from "@/lib/prisma";

import HomeButton from "./HomeButton";

// 모든 프로젝트 상세를 빌드 시 정적으로 생성해 요청마다 DB를 조회하지 않도록 한다
export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { id: true } });
  return projects.map(({ id }) => ({ id: String(id) }));
}

export default function ProjectPage({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="w-full max-w-screen-md mx-auto px-4 py-8 md:py-12">
      <ProjectModal id={Number(id)} />
      <HomeButton />
    </div>
  );
}
