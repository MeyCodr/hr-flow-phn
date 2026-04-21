import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-poppins">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-8xl font-bold text-indigo-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href={withBasePath("/dashboard")}
          className="bg-indigo-800 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
