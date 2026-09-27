import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="w-full max-w-screen-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-3">
      <p className="text-lg md:text-xl font-semibold text-foreground/80">존재하지 않는 프로젝트예요</p>
      <p className="text-sm text-foreground/50">링크가 오래되었거나 프로젝트가 삭제되었을 수 있어요.</p>
      <Link
        href="/"
        className="mt-4 px-5 py-2.5 rounded-md bg-foreground/5 text-foreground/75 hover:bg-foreground/10 hover:text-foreground text-sm"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
