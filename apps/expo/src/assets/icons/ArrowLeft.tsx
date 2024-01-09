import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const ArrowLeft = (props: SvgProps) => (
  <Svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="h-6 w-6"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </Svg>
);
export default ArrowLeft;
