import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // VPN 등으로 localhost가 아닌 출처에서 dev 서버에 접속하면, Next.js가 JS 청크/HMR
  // 요청을 기본 차단해 하이드레이션이 안 되는 문제가 생긴다. 접속에 쓰는 IP/호스트를
  // 커밋되는 파일에 그대로 노출하지 않도록 .env.local의 DEV_ALLOWED_ORIGINS로 관리한다.
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export default nextConfig;
