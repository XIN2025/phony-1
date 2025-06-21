import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequestWithAuth) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const authToken = (await getToken({ req: request }))?.token as string;

  const isNewUser = (await cookies()).get('is_new')?.value === 'true';
  if (isNewUser && !isAuthRoute) {
    const response = NextResponse.redirect(
      new URL(
        `/linkedin-profile?redirectTo=${request.nextUrl.pathname}${request.nextUrl.search ? request.nextUrl.search : ''}`,
        request.url,
      ),
    );
    response.cookies.set({
      name: 'is_new',
      value: 'false',
      path: '/',
      expires: new Date(0),
    });
    return response;
  }

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthRoute && !authToken) {
    return NextResponse.redirect(
      new URL(
        `/auth?redirectTo=${request.nextUrl.pathname}${request.nextUrl.search ? request.nextUrl.search : ''}`,
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - static (static files)
     * - _next (Next.js internals)
     * - unsubscribe (unsubscribe page)
     * - auth/vscode-callback (VS Code callback)
     * - project (project page)
     *
     * This excludes favicon.ico and robots.txt as well.
     */
    '/((?!api|static|.*\\..*|_next|unsubscribe|auth/vscode-callback|project).*)',
  ],
};
