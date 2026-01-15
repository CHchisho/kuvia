import localFont from "next/font/local";

const DharmaGothicE = localFont({
  src: [
    {
      path: "../../public/fonts/DharmaGothicE/DharmaGothicE-ExLight.ttf",
      weight: "200",
    },
    {
      path: "../../public/fonts/DharmaGothicE/DharmaGothicE-Light.ttf",
      weight: "300",
    },
    {
      path: "../../public/fonts/DharmaGothicE/DharmaGothicE-Bold.ttf",
      weight: "700",
    },
    {
      path: "../../public/fonts/DharmaGothicE/DharmaGothicE-ExBold.ttf",
      weight: "800",
    },
    {
      path: "../../public/fonts/DharmaGothicE/DharmaGothicE-Heavy.ttf",
      weight: "900",
    },
  ],
  preload: true,
  display: "swap",
  variable: "--DharmaGothicE",
  fallback: ["sans-serif"],
});

const GeistMono = localFont({
  src: [
    {
      path: "../../public/fonts/GeistMono/GeistMono-VariableFont_wght.ttf",
      weight: "100 900",
    },
  ],
  preload: true,
  display: "swap",
  variable: "--GeistMono",
  fallback: ["sans-serif"],
});

export { DharmaGothicE, GeistMono };
