import { headers } from "next/headers"

export type BrandTheme = "blue" | "green"

export interface BrandConfig {
    id: string
    name: string
    theme: BrandTheme
    description: string
}

export const brands: Record<string, BrandConfig> = {
    "blue": {
        id: "blue",
        name: "Official Compliance Services",
        theme: "blue",
        description: "The trusted source for your annual filing needs.",
    },
    "green": {
        id: "green",
        name: "ComplianceFlow Modern",
        theme: "green",
        description: "Fast, automated, and secure filing for your business.",
    },
}

export const getBrandByHostname = (hostname: string): BrandConfig => {
    // Simple mapping for demo purposes
    if (hostname.includes("modern") || hostname.includes("green")) {
        return brands["green"]
    }
    // Default to official/blue
    return brands["blue"]
}

export const getBrand = async (): Promise<BrandConfig> => {
    const headersList = await headers()
    const brandId = headersList.get("x-brand") || "blue"
    return brands[brandId] || brands["blue"]
}
