import type { IconProps } from "./types";
import type { SVGProps } from "react";

export const IconTwitter = ({
  size = 14,
  color,
  className,
  ...rest
}: IconProps & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M7.14167 5.08125L11.6089 0H10.5502L6.67144 4.41188L3.57333 0H0L4.68491 6.67163L0 12H1.0587L5.15496 7.34091L8.42667 12H12L7.14138 5.08125H7.14167ZM5.69168 6.73031L5.21695 6.066L1.44012 0.779812H3.0662L6.11401 5.046L6.58866 5.71031L10.5507 11.2556H8.92479L5.69168 6.73059V6.73031Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
