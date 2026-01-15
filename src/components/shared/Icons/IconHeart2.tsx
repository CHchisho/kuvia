import type { IconProps } from "./types";
import type { SVGProps } from "react";

export const IconHeart2 = ({
  size = 14,
  color,
  stroke,
  className,
  ...rest
}: IconProps & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M5.56836 1.5V3.49609H8.43164V1.5H11.1357V3.49609H13V6.5H11.1357V8.49609H9.28418V10.5039H7.43164V12.5H6.56836V10.5039H4.71582V8.49609H2.85156V6.5H1V3.49609H2.85156V1.5H5.56836Z"
        fill="none"
        stroke={stroke || "currentColor"}
      />
    </svg>
  );
};
