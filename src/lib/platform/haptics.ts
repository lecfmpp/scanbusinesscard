/**
 * Haptic feedback.
 *
 * Web: every call is a no-op and nothing native is imported.
 * Native (iOS): dynamically imports @capacitor/haptics.
 *
 * Reserved for moments the user caused and would feel on a physical device —
 * a scan completing, a purchase landing, an action failing. Firing on ordinary
 * taps makes a device feel noisy rather than responsive, and iOS users notice.
 */
import { isNative } from "./index";

type Feel = "success" | "warning" | "error" | "light";

export async function haptic(feel: Feel = "light"): Promise<void> {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      /* @vite-ignore */ "@capacitor/haptics"
    );

    if (feel === "light") {
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }

    const type =
      feel === "success"
        ? NotificationType.Success
        : feel === "warning"
          ? NotificationType.Warning
          : NotificationType.Error;

    await Haptics.notification({ type });
  } catch (err) {
    // Never let feedback break the action it was decorating.
    console.error("[haptics] unavailable:", err);
  }
}
