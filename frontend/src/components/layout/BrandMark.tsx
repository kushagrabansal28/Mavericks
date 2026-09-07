import Image from "next/image";

/** Shared product mark.  Keeping it in one component prevents the app from
 * drifting back to several slightly different lightning icons. */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/gridsense-mark.svg"
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[10px]"
      priority
    />
  );
}
