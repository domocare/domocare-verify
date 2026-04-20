export type CompanyBrand = {
  name: string;
  logo: string;
  accent: string;
  soft: string;
};

export const companyBrands: CompanyBrand[] = [
  {
    name: "Domocare",
    logo: "/brands/domocare.png",
    accent: "text-sky-700",
    soft: "bg-sky-50 border-sky-100",
  },
  {
    name: "Lantana Paysage",
    logo: "/brands/lantana-paysage.jpg",
    accent: "text-emerald-700",
    soft: "bg-emerald-50 border-emerald-100",
  },
  {
    name: "SAGEAU",
    logo: "/brands/sageau.jpg",
    accent: "text-blue-700",
    soft: "bg-blue-50 border-blue-100",
  },
];

function normalizeBrandName(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getCompanyBrand(company?: string | null) {
  const normalized = normalizeBrandName(company);

  if (normalized.includes("lantana")) {
    return companyBrands.find((brand) => brand.name === "Lantana Paysage") || companyBrands[0];
  }

  if (normalized.includes("sageau")) {
    return companyBrands.find((brand) => brand.name === "SAGEAU") || companyBrands[0];
  }

  if (normalized.includes("domocare")) {
    return companyBrands.find((brand) => brand.name === "Domocare") || companyBrands[0];
  }

  return companyBrands[0];
}
