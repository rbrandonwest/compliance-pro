"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "use-debounce"

interface Company {
    documentNumber: string
    companyName: string
    status: string
}

export function BusinessSearch() {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = React.useState<Company[]>([])
    const [loading, setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        async function search() {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`/api/companies/search?query=${encodeURIComponent(debouncedQuery)}`)
                const data = await res.json()
                setResults(data.results || [])
                setOpen(true)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        search()
    }, [debouncedQuery])

    return (
        <div className="w-full max-w-lg relative">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Company Name (e.g. ABC Corp)..."
                    className="pl-10 h-12 text-lg"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value.toUpperCase())
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-popover rounded-md border shadow-md z-50 overflow-hidden">
                    <ul className="max-h-[300px] overflow-auto py-1">
                        {results.map((company) => (
                            <li
                                key={company.documentNumber}
                                className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                                onClick={() => {
                                    router.push(`/file/${company.documentNumber}`)
                                    setOpen(false)
                                }}
                            >
                                <div className="font-medium">{company.companyName}</div>
                                <div className="text-xs text-muted-foreground flex justify-between">
                                    <span>Doc: {company.documentNumber}</span>
                                    <span className={company.status === "Active" ? "text-green-600" : "text-gray-500"}>
                                        {company.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {open && query.length >= 2 && !loading && results.length === 0 && (
                <div className="absolute w-full mt-2 bg-popover rounded-md border shadow-md z-50 p-4 text-center text-sm text-muted-foreground">
                    No companies found.
                </div>
            )}
        </div>
    )
}
