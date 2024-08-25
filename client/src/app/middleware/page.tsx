// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const role = req.cookies.get('role');

  if (!token || !role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const restrictedRoles = {
    admin: ['provider', 'customer'],
    provider: ['admin', 'customer'],
    customer: ['admin', 'provider'],
  };

  const currentPath = req.nextUrl.pathname;

  // Check if the role is restricted from accessing the path
  for (const [restrictedRole, restrictedPaths] of Object.entries(restrictedRoles)) {
    if (restrictedPaths.includes(role) && currentPath.includes(restrictedRole)) {
      return NextResponse.redirect(new URL('/home/403', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*', '/customer/:path*'],
};
