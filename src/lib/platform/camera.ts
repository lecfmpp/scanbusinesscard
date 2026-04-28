/**
 * Camera shim — picks images for business card scanning.
 *
 * Web: returns null so callers fall back to the existing <input type="file"> flow.
 *      No Capacitor code is imported in browsers.
 * Native (iOS): dynamically imports @capacitor/camera and returns base64 data URLs.
 *
 * `pickImagesNative()` returns null on web so the caller knows to use its existing path.
 */
import { isNative } from "./index";

export async function pickImagesNative(): Promise<string[] | null> {
  if (!isNative) return null;

  // Dynamic import — only loaded on native platforms, never bundled into the web build.
  const { Camera } = await import(/* @vite-ignore */ "@capacitor/camera");

  const result = await Camera.pickImages({
    quality: 85,
    limit: 20,
  });

  // Convert returned file URIs to base64 data URLs to match the existing web flow.
  const dataUrls = await Promise.all(
    result.photos.map(async (photo) => {
      const response = await fetch(photo.webPath ?? photo.path ?? "");
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })
  );

  return dataUrls;
}
