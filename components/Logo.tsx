/* eslint-disable @next/next/no-img-element */

/**
 * AirPay logo — renders the brand asset at /public/logo.png (icon + "airpay" wordmark).
 * The artwork is bright purple, so it reads on both light and dark backgrounds;
 * `variant` is kept for API compatibility but no longer alters rendering.
 */
export function Logo({
  withText = true,
  variant = "dark",
}: {
  withText?: boolean;
  variant?: "dark" | "light";
}) {
  void variant;

  // Icon-only: crop to the mark (x:32–375 of the 1000×284 artwork).
  if (!withText) {
    return (
      <span className="block h-9 overflow-hidden" style={{ width: 50 }} aria-label="AirPay">
        <img
          src="/logo.png"
          alt=""
          draggable={false}
          className="h-9 max-w-none select-none"
          style={{ width: 127 }}
        />
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="AirPay"
      draggable={false}
      className="h-8 w-auto select-none"
    />
  );
}
