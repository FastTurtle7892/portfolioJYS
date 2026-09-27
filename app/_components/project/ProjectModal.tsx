import cn from "classnames";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "react-feather";

import { withDbRetry } from "@/lib/dbRetry";
import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import Collapsible from "./Collapsible";
import ProjectLogo from "./ProjectLogo";
import SpecTable, { parseSpecRows } from "./SpecTable";
import SkillItem from "../skill/SkillItem";

interface ProjectModalProps {
  id: number;
}

interface ProjectLink {
  href: string;
  label: string;
}

// 유튜브 링크(watch?v=... / youtu.be/...)에서 영상 ID를 뽑는다. VIDEO 타입/videoUrl 필드에서 썸네일을 만들 때 쓴다.
const YOUTUBE_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
const getYoutubeId = (href: string) => href.match(YOUTUBE_PATTERN)?.[1];

// 프리뷰 클립이 영상(mp4/webm/mov)인지 정적 이미지(webp/gif 등)인지 확장자로 구분한다.
const VIDEO_EXT_PATTERN = /\.(mp4|webm|mov)$/i;

type ProjectItemRow = Awaited<ReturnType<typeof getProjectById>>["items"][number];

async function getProjectById(id: number) {
  // findUniqueOrThrow 대신 findUnique + notFound()를 사용해, id가 존재하지 않을 때
  // (오래된 링크, 삭제된 프로젝트 등) 서버 에러가 아니라 정상적인 404로 처리한다.
  // DB 연결 자체가 일시적으로 실패하는 경우(무료 티어 DB의 슬립/재연결 지연 등)는
  // withDbRetry가 짧게 한 번 더 시도해 순간적인 오류를 흡수한다.
  const responseProject = await withDbRetry(() => prisma.project.findUnique({ where: { id } }));

  if (!responseProject) {
    notFound();
  }

  const responseItems = await withDbRetry(() =>
    prisma.projectItem.findMany({ where: { projectId: id }, orderBy: { row_number: "asc" } }),
  );

  const { links, skill_ids, ...res } = responseProject;
  const responseSkills = await withDbRetry(() => getSkills(skill_ids));

  return {
    ...res,
    links: links.map(link => parsePrismaJSON<ProjectLink>(link)),
    items: responseItems,
    skills: responseSkills,
  };
}

// 연속된 GALLERY 아이템은 하나의 그리드로, 같은 group_key를 가진 연속된 블록들은 하나의 박스로 묶는다.
// (예: "프로젝트 개요" 텍스트 + 비교 사진 2장 + 드롭다운을 한 박스로 합칠 때 세 아이템 모두 같은 group_key를 가짐)
type LeafBlock =
  | { kind: "gallery"; key: string; items: ProjectItemRow[] }
  | { kind: "item"; key: string; item: ProjectItemRow };

type RenderBlock = LeafBlock | { kind: "group"; key: string; title: string; children: LeafBlock[] };

function leafGroupKey(block: LeafBlock): string | null {
  if (block.kind === "gallery") return block.items[0]?.group_key ?? null;
  return block.item.group_key ?? null;
}

function leafTitle(block: LeafBlock): string {
  if (block.kind === "gallery") return block.items[0]?.title ?? "";
  return block.item.title;
}

function groupItemsIntoBlocks(items: ProjectItemRow[]): RenderBlock[] {
  // 1단계: 연속된 GALLERY 아이템을 그리드로 묶는다 (단, group_key가 다르면 따로 묶지 않는다)
  const leaves: LeafBlock[] = [];

  items.forEach((item, index) => {
    if (item.type === "GALLERY") {
      const last = leaves[leaves.length - 1];
      if (last?.kind === "gallery" && (last.items[0]?.group_key ?? null) === (item.group_key ?? null)) {
        last.items.push(item);
        return;
      }
      leaves.push({ kind: "gallery", key: `gallery-${index}`, items: [item] });
      return;
    }
    leaves.push({ kind: "item", key: `item-${index}`, item });
  });

  // 2단계: 같은 group_key를 가진 연속된 블록들을 하나의 group 블록으로 묶는다
  const blocks: RenderBlock[] = [];

  leaves.forEach((leaf, index) => {
    const groupKey = leafGroupKey(leaf);

    if (groupKey) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "group" && last.key === `group-${groupKey}`) {
        last.children.push(leaf);
        return;
      }
      blocks.push({ kind: "group", key: `group-${groupKey}`, title: leafTitle(leaf), children: [leaf] });
      return;
    }

    blocks.push(leaf);
  });

  return blocks;
}

// 비교용 사진은 잘리거나 클릭해야 보이면 안 되므로, 크롭 없이(object-contain) 같은 크기 박스 안에
// 나란히 바로 보여준다.
// blobUrl이 .webm/.mp4면 자동재생 반복 비디오로, 그 외(이미지)는 next/image로 렌더링한다.
function GalleryBlock({ items }: { items: ProjectItemRow[] }) {
  const isSingle = items.length === 1;
  // 사진이 4장 이상이면(모바일 스크린샷 모음 등) 가로 긴 aspect-video에 널을 가들여 작게 보이는 대신,
  // 세로로 긴 비율로 크게 보여주고 4컴·2컴으로 배치한다.
  const isLargePortraitGrid = items.length >= 4;

  return (
    <div
      className={cn(
        "grid gap-3",
        isSingle && "grid-cols-1",
        !isSingle && isLargePortraitGrid && "grid-cols-2 sm:grid-cols-4",
        !isSingle && !isLargePortraitGrid && (items.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"),
      )}
    >
      {items.map((item, index) => {
        const isVideo = /\.(webm|mp4)$/i.test(item.blobUrl ?? "");

        return (
          <figure key={`gallery-figure-${index}`} className="flex flex-col gap-1.5">
            <div
              className={cn(
                "relative w-full rounded-md overflow-hidden bg-foreground/5 border border-foreground/10",
                isLargePortraitGrid ? "aspect-[9/16]" : "aspect-video",
              )}
            >
              {isVideo ? (
                <video
                  src={item.blobUrl ?? ""}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={item.blobUrl ?? ""}
                  alt={item.title}
                  fill
                  unoptimized={item.blobUrl?.endsWith(".webp")}
                  className="object-contain"
                />
              )}
            </div>
            {item.title && <figcaption className="text-xs md:text-sm text-foreground/50 text-center">{item.title}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

// 유튜브 링크를 재생 아이콘이 올라간 썸네일 카드로 보여준다. VIDEO 타입과, TEXT 아이템의 videoUrl 둘 다에서 재사용.
function YoutubeThumbLink({ href, thumbnailSrc, alt }: { href: string; thumbnailSrc?: string; alt: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full max-w-sm aspect-video rounded-md overflow-hidden bg-foreground/5 border border-foreground/10 group/video"
    >
      {thumbnailSrc && <Image src={thumbnailSrc} alt={alt} fill unoptimized className="object-cover" />}
      <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/video:bg-black/25 transition-colors">
        <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow" strokeWidth={1.5} />
      </span>
    </a>
  );
}

// VIDEO: content[0]에 유튜브 링크, blobUrl은 선택적 커스텀 썸네일(없으면 유튜브 기본 썸네일).
// next/image 최적화(서버 처리)를 안 타도록 unoptimized로 렌더링 — 유튜브 CDN 이미지를 그대로 보여주기만 하면 되므로
// Vercel 쪽에 이미지 최적화 부하가 전혀 없다.
function VideoBlock({ item }: { item: ProjectItemRow }) {
  const href = item.content[0];
  const videoId = href ? getYoutubeId(href) : undefined;
  const thumbnailSrc = item.blobUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined);

  if (!href) return null;

  return (
    <div className="flex flex-col gap-2">
      <YoutubeThumbLink href={href} thumbnailSrc={thumbnailSrc} alt={item.title || "데모 영상"} />
      {item.title && <p className="text-xs md:text-sm text-foreground/50">{item.title}</p>}
    </div>
  );
}

// 헤더 구분선 바로 아래, intro_image_url(사진)과 preview_clip_url(반복재생 데모 클립)을 나란히 보여준다.
// 각 필드는 "|"로 여러 URL을 구분할 수 있다 (예: "사진1.webp|사진2.webp") — 2장 이상의 사진/영상을
// 한 줄에 나란히 크게 보여주고 싶을 때 사용. 필드하나당 1개면 기존과 동일하게 동작한다.
// .mp4/.webm은 muted+loop 비디오로, 그 외(.webp/.gif 등)는 정적 이미지 태그로 자동 반복 재생시킨다.
// 서버 부하를 늘리는 next/image 최적화 파이프라인은 타지 않는다(unoptimized).
function IntroMedia({ imageUrl, clipUrl }: { imageUrl?: string | null; clipUrl?: string | null }) {
  const images = imageUrl ? imageUrl.split("|").filter(Boolean) : [];
  const clips = clipUrl ? clipUrl.split("|").filter(Boolean) : [];
  const mediaList = [...images, ...clips];

  if (mediaList.length === 0) return null;

  // 아이템이 3개 이상이면(사진2장+영상2개 등) 세로로 긴 모바일 스크린샷 비율로,
  // 기존처럼 1장+1개(또는 단독 1개)면 가로로 긴 aspect-video 비율을 그대로 쓴다.
  const isPortraitLayout = mediaList.length > 2;
  const aspectClass = isPortraitLayout ? "aspect-[9/16]" : "aspect-video";
  const gridColsClass =
    mediaList.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : mediaList.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  return (
    <div className={cn("grid gap-3", gridColsClass)}>
      {mediaList.map((src, index) => {
        const isVideo = VIDEO_EXT_PATTERN.test(src);

        return (
          <div
            key={`intro-media-${index}`}
            className={cn("relative w-full rounded-lg overflow-hidden bg-foreground/5 border border-foreground/10", aspectClass)}
          >
            {isVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={src} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <Image src={src} alt="프로젝트 소개 이미지" fill unoptimized={src.endsWith(".webp")} className="object-contain" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// "문제 해결" 전용 카드. content는 [문제, 해결, 결과] 정확히 3개.
// 텍스트에 라벨을 직접 박아넣지 않고, 레이아웃(콜아웃 박스 + 라벨-본문 행)으로 구조를 보여준다.
function ProblemBlock({ item }: { item: ProjectItemRow }) {
  const [problem, solution, result] = item.content;

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 md:p-6 flex flex-col gap-4">
      <p className="font-semibold text-base md:text-lg">{item.title}</p>

      {problem && (
        <div className="rounded-lg bg-background border border-foreground/10 px-4 py-3 flex flex-col gap-1">
          <span className="text-xs md:text-sm font-semibold text-foreground/40">문제</span>
          <p className="text-foreground/80">{parse(problem)}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {[
          { label: "해결", text: solution },
          { label: "결과", text: result },
        ].map(
          ({ label, text }) =>
            text && (
              <div key={label} className="flex gap-3 md:gap-4">
                <span className="shrink-0 w-10 md:w-12 pt-0.5 text-xs md:text-sm font-semibold text-foreground/40">
                  {label}
                </span>
                <p className="text-foreground/80 flex-1">{parse(text)}</p>
              </div>
            ),
        )}
      </div>
    </div>
  );
}

// COLLAPSIBLE: content가 4개 또는 5개([좌측제목, 좌측설명, 우측제목, 우측설명, (선택)하단제목])면 좌/우 2단 비교 레이아웃,
// 7개([도입설명, 좌측제목, 좌측식, 우측제목, 우측식, 상쇄설명, 거리보정설명])면 도입부(설명+blobUrl 이미지) + 2단 수식 비교
// (blobUrl2=좌측 이미지, blobUrl3=우측 이미지) + 하단 2개 섹션(구분선으로 분리) 순서로 렌더링,
// 그 외엔 기존처럼 문단을 순서대로 나열 + blobUrl 이미지 1장(선택).
function CollapsibleItem({ item }: { item: ProjectItemRow }) {
  const isDualColumn = item.content.length === 4 || item.content.length === 5;
  const isRichDual = item.content.length === 7;

  if (isRichDual) {
    const [introText, leftHeading, leftFormula, rightHeading, rightFormula, cancelText, distanceText] = item.content;
    const columns = [
      { heading: leftHeading, formula: leftFormula, image: item.blobUrl2 },
      { heading: rightHeading, formula: rightFormula, image: item.blobUrl3 },
    ];
    const dividerClass = "sm:border-l sm:border-foreground/15 sm:pl-4";

    return (
      <Collapsible label={item.title}>
        {introText && <div className="text-foreground/80">{parse(introText)}</div>}
        {item.blobUrl && (
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-background border border-foreground/10">
            <Image
              src={item.blobUrl}
              alt={`${item.title} 패킷 교환`}
              fill
              unoptimized={item.blobUrl.endsWith(".webp")}
              className="object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-0 gap-y-2 pt-1">
          {columns.map((col, index) => (
            <p key={`rich-heading-${index}`} className={cn("font-semibold text-foreground/80", index === 1 && dividerClass)}>
              {parse(col.heading)}
            </p>
          ))}
          {columns.map((col, index) => (
            <div key={`rich-formula-${index}`} className={cn("text-foreground/80", index === 1 && dividerClass)}>
              {parse(col.formula)}
            </div>
          ))}
          {columns.map((col, index) => (
            <div key={`rich-image-${index}`} className={cn(index === 1 && dividerClass)}>
              {col.image && (
                <div className="relative aspect-video rounded-md overflow-hidden bg-background border border-foreground/10">
                  <Image
                    src={col.image}
                    alt={`${item.title} ${index === 0 ? "좌측" : "우측"} 다이어그램`}
                    fill
                    unoptimized={col.image.endsWith(".webp")}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {cancelText && (
          <>
            <div className="w-full h-[1px] bg-foreground/15" />
            <div className="text-foreground/80">{parse(cancelText)}</div>
          </>
        )}

        {distanceText && (
          <>
            <div className="w-full h-[1px] bg-foreground/15" />
            <div className="text-foreground/80">{parse(distanceText)}</div>
          </>
        )}
      </Collapsible>
    );
  }

  if (isDualColumn) {
    const columns = [
      { heading: item.content[0], text: item.content[1], image: item.blobUrl },
      { heading: item.content[2], text: item.content[3], image: item.blobUrl2 },
    ];
    const fusionTitle = item.content[4];
    // content가 5개(fusionTitle 있음)면 기존처럼 헤딩→설명→이미지 순서.
    // content가 정확히 4개면 헤딩→이미지→(이미지 아래) 한 줄 설명 순서로 렌더링.
    const imageFirst = !fusionTitle;

    // 좌/우 컬럼을 각각 독립된 세로 스택으로 쌓으면, 텍스트 길이가 달라질 때마다 이미지 위치(y좌표)가
    // 서로 어긋난다. 그래서 헤딩 행 / 설명 행 / 이미지 행을 각각 하나의 그리드 행으로 나란히 배치해
    // 좌우 이미지가 항상 같은 y좌표에서 시작하도록 한다.
    const dividerClass = "sm:border-l sm:border-foreground/15 sm:pl-4";

    const headingRow = columns.map((col, index) => (
      <p key={`collapsible-heading-${index}`} className={cn("font-semibold text-foreground/80", index === 1 && dividerClass)}>
        {parse(col.heading)}
      </p>
    ));
    const textRow = columns.map((col, index) => (
      <div key={`collapsible-text-${index}`} className={cn("text-foreground/80", index === 1 && dividerClass)}>
        {parse(col.text)}
      </div>
    ));
    const imageRow = columns.map((col, index) => (
      <div key={`collapsible-image-${index}`} className={cn(index === 1 && dividerClass)}>
        {col.image && (
          <div className="relative aspect-video rounded-md overflow-hidden bg-background border border-foreground/10">
            <Image
              src={col.image}
              alt={`${item.title} ${index === 0 ? "좌측" : "우측"} 다이어그램`}
              fill
              unoptimized={col.image.endsWith(".webp")}
              className="object-contain"
            />
          </div>
        )}
      </div>
    ));

    return (
      <Collapsible label={item.title}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-0 gap-y-2">
          {headingRow}
          {imageFirst ? imageRow : textRow}
          {imageFirst ? textRow : imageRow}
        </div>

        {fusionTitle && (
          <>
            <div className="w-full h-[1px] bg-foreground/15" />
            <p className="font-semibold text-foreground/80">{parse(fusionTitle)}</p>
            {item.blobUrl3 && (
              <div className="relative w-full aspect-video rounded-md overflow-hidden bg-background border border-foreground/10">
                <Image
                  src={item.blobUrl3}
                  alt={fusionTitle}
                  fill
                  unoptimized={item.blobUrl3.endsWith(".webp")}
                  className="object-contain"
                />
              </div>
            )}
          </>
        )}
      </Collapsible>
    );
  }

  return (
    <Collapsible label={item.title}>
      {item.content.map((text, index) => (
        <p key={`collapsible-p-${index}`}>{parse(text)}</p>
      ))}
      {item.blobUrl && (
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-foreground/5 border border-foreground/10">
          <Image src={item.blobUrl} alt={item.title} fill unoptimized={item.blobUrl.endsWith(".webp")} className="object-contain" />
        </div>
      )}
    </Collapsible>
  );
}

// TEXT 아이템의 본문(제목 제외). blobUrl이 있으면 이미지, videoUrl이 있으면 유튜브 썸네일을 함께 보여준다.
function TextItemBody({ item }: { item: ProjectItemRow }) {
  const videoId = item.videoUrl ? getYoutubeId(item.videoUrl) : undefined;
  const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;

  return (
    <>
      {item.blobUrl && (
        <div
          className={cn(
            "relative aspect-video rounded-md overflow-hidden bg-background border border-foreground/10",
            item.imageWidthPercent ? "mx-auto" : "w-full",
          )}
          style={item.imageWidthPercent ? { width: `${item.imageWidthPercent}%` } : undefined}
        >
          <Image src={item.blobUrl} alt={item.title} fill unoptimized={item.blobUrl.endsWith(".webp")} className="object-contain" />
        </div>
      )}
      <ul className="text-foreground/80 marker:text-foreground/60 list-disc list-inside -indent-5 pl-5">
        {item.content.map((text, contentIndex) => (
          <li key={`text-${item.id}-${contentIndex}`} className="mb-1 last:mb-0">
            {parse(text)}
          </li>
        ))}
      </ul>
      {item.videoUrl && <YoutubeThumbLink href={item.videoUrl} thumbnailSrc={videoThumbnail} alt="데모 영상" />}
    </>
  );
}

// group 블록 내부 자식 1개를 렌더링한다. 그룹 제목은 바깥 박스에서 한 번만 보여주므로,
// TEXT류 아이템은 제목 없이 본문만 표시한다.
function renderGroupChild(child: LeafBlock) {
  if (child.kind === "gallery") {
    return <GalleryBlock key={child.key} items={child.items} />;
  }

  const { item } = child;

  if (item.type === "COLLAPSIBLE") {
    return <CollapsibleItem key={child.key} item={item} />;
  }

  if (item.type === "VIDEO") {
    return <VideoBlock key={child.key} item={item} />;
  }

  if (item.type === "TABLE") {
    return (
      <div key={child.key}>
        <SpecTable rows={parseSpecRows(item.content)} />
      </div>
    );
  }

  return (
    <div key={child.key} className="flex flex-col gap-3">
      <TextItemBody item={item} />
    </div>
  );
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  const { title, sub_title, member, period, skills, links, items, logo_url, preview_clip_url, intro_image_url } =
    await getProjectById(id);

  const blocks = groupItemsIntoBlocks(items);

  const skillsElement = (
    <ul className="p-0 flex gap-2 list-none flex-wrap">
      {skills.map(({ id, item, blobUrl }) => (
        <li key={`project-info-skill-${id}`} className="indent-0">
          <SkillItem size="xs" label={item} imageUrl={blobUrl} />
        </li>
      ))}
    </ul>
  );

  const linksElement = (
    <div className="flex gap-2 flex-wrap items-center">
      {links.map(({ href, label }) => {
        const isInternal = href.startsWith("/");
        return (
          <Link
            key={`link-${label}`}
            href={href}
            {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <div id="project-modal-header" className="flex flex-col gap-3 md:gap-6">
        <ProjectLogo id={id} label={title} logoUrl={logo_url} className="w-12 md:w-14 h-12 md:h-14 text-xl p-1.5" />

        <p className="text-xl md:text-2xl font-semibold leading-normal break-keep mb-4">{parse(title)}</p>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground/50">프로젝트 설명</p>
          <div className="text-sm font-semibold text-foreground/80">{parse(sub_title)}</div>
        </div>

        <IntroMedia imageUrl={intro_image_url} clipUrl={preview_clip_url} />

        <div className="flex gap-6 flex-wrap">
          {[
            { title: "기술 스택", content: skillsElement, isFull: true },
            { title: "참여인원", content: parse(member) },
            { title: title === "IEEE 802.15.4z UWB 거리측정 성능 최적화" ? "게재" : "기간", content: period },
            ...(links.length ? [{ title: "관련 링크", content: linksElement, isFull: true }] : []),
          ].map(({ title, content, isFull }) => (
            <div key={`project-info-${title}`} className={cn("flex flex-col gap-1", isFull && "w-full")}>
              <p className="text-sm font-medium text-foreground/50">{title}</p>
              <div className="text-sm font-semibold text-foreground/80">{content}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] min-h-[1px] bg-foreground/10 my-3 md:my-4" />

      <div id="project-modal-content" className="text-sm md:text-base flex flex-col gap-8 md:gap-10">
        {blocks.map(block => {
          if (block.kind === "group") {
            return (
              <div key={block.key} className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 md:p-6 flex flex-col gap-4">
                <p className="font-semibold text-base md:text-lg">{block.title}</p>
                {block.children.map(child => renderGroupChild(child))}
              </div>
            );
          }

          if (block.kind === "gallery") {
            return <GalleryBlock key={block.key} items={block.items} />;
          }

          const { item } = block;

          if (item.type === "COLLAPSIBLE") {
            return <CollapsibleItem key={block.key} item={item} />;
          }

          if (item.type === "TABLE") {
            return (
              <div key={block.key}>
                <p className="font-semibold text-base md:text-lg mb-3">{item.title}</p>
                <SpecTable rows={parseSpecRows(item.content)} />
              </div>
            );
          }

          if (item.type === "VIDEO") {
            return <VideoBlock key={block.key} item={item} />;
          }

          if (item.type === "PROBLEM") {
            return <ProblemBlock key={block.key} item={item} />;
          }

          // TEXT (기본) — 카드형 박스로 렌더링
          return (
            <div key={block.key} className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 md:p-6 flex flex-col gap-3">
              <p className="font-semibold text-base md:text-lg">{item.title}</p>
              <TextItemBody item={item} />
            </div>
          );
        })}
      </div>
    </>
  );
}
