import Image from "next/image";
import type { CompanyBrand } from "@/lib/company-branding";

type CompanyLogoProps = {
  brand: CompanyBrand;
  className?: string;
  preload?: boolean;
};

export default function CompanyLogo({
  brand,
  className = "",
  preload = false,
}: CompanyLogoProps) {
  const sizeClass = className || "h-20 w-44 p-4";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border bg-white shadow-sm ${sizeClass}`}
    >
      <Image
        src={brand.logo}
        alt={`Logo ${brand.name}`}
        width={180}
        height={80}
        className="max-h-12 w-auto object-contain"
        preload={preload}
        unoptimized
      />
    </div>
  );
}
