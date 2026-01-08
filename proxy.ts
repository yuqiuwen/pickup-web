import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Proxy configuration for Next.js
 * This handles API proxying to the backend FastAPI server
 */
const API_PREFIX = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  

// 不需要认证的路径
const publicPaths = ['/'];



export default async function proxy(request: NextRequest) {

    const { pathname } = request.nextUrl;
    console.log('pathname', pathname);
  
    // 检查是否有 access_token（从 cookie 中读取）
    const token = request.cookies.get('access_token')?.value;
    
    // 如果是公开路径，直接放行
    if (publicPaths.some(path => pathname === path)) {
      return NextResponse.next();
    }
    
    // 如果是受保护路径，检查是否已登录
    if (!token) {
        // 未登录，重定向到首页
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(homeUrl);
      }
    
    
    return NextResponse.next();
    
    
}



export const config = {
    matcher: [
      /*
       * 匹配所有路径，除了：
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public folder
       */
      '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
  };