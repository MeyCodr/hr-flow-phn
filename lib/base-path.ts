const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath =
  rawBasePath === "/" ? "" : rawBasePath.replace(/\/+$/, "");

export function withBasePath(path: string) {
  if (!path) {
    return basePath || "/";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
}

export const authBasePath = withBasePath("/api/auth");
