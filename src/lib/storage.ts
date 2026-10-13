import { STORAGE_BUCKETS } from "./constants";

export function storageUrl(
  path: string | null | undefined,
  bucket: string = STORAGE_BUCKETS.propertyImages,
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
