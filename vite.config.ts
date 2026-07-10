import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 배포 위치에 따라 base 경로가 달라집니다.
  //  - Netlify/Vercel: 도메인 루트(/) 에서 서빙
  //  - GitHub Pages/로컬: /react-whatever-you-want/ 하위에서 서빙
  base: process.env.NETLIFY || process.env.VERCEL ? '/' : '/react-whatever-you-want/',
  server: {
    proxy: {
      // 브라우저의 "/subwayApi..." 요청을 서울시 API 서버로 대신 전달(프록시)합니다.
      // 개발 중 CORS(교차 출처 차단) 문제를 우회하기 위한 설정입니다.
      '/subwayApi': {
        target: 'http://openapi.seoul.go.kr:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/subwayApi/, ''),
      },
    },
  },
})