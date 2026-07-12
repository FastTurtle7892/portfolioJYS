import { Gothic_A1 } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";

const inter = Gothic_A1({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "장윤석 | Embedded Software Engineer",
  description:
    "UWB 실내측위와 임베디드 시스템, 신호처리를 중심으로 cm급 정밀도의 위치 인식 시스템을 만드는 장윤석의 포트폴리오입니다.",
  keywords: [
    "임베디드 개발자",
    "UWB 실내측위",
    "신호처리",
    "임베디드 시스템 포트폴리오",
    "자율주행 임베디드",
    "장윤석",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout(props: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {props.children}
        {props.modal}
        <div id="modal-root" />
      </body>
    </html>
  );
}
