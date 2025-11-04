
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // redirect here if not logged in
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/dashboard", 
    "/dashboard/:path*", 
    "/admin", 
    "/admin/:path*", 
    "/profile", 
    "/profile/:path*"
  ],
};
