"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, Menu, X, FileText, Shield } from "lucide-react"

export function Header() {
    const { data: session } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo + Brand */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base tracking-tight leading-tight text-foreground">
                                Business Annual Report Filing
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground leading-tight tracking-wide uppercase">
                                Florida Business Compliance
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                {session && (
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        <Link href="/dashboard" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                            Dashboard
                        </Link>
                    </nav>
                )}

                {/* Right side: Auth + Mobile toggle */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                                    <div className="text-sm text-right hidden md:block">
                                        <div className="font-medium leading-tight">{session.user?.name || "User"}</div>
                                        <div className="text-xs text-muted-foreground leading-tight">{session.user?.email}</div>
                                    </div>
                                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                            {session.user?.email ? getInitials(session.user.email) : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{session.user?.name || "User"}</p>
                                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/file" className="flex items-center w-full cursor-pointer">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>File Report</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/file">
                                <Button size="sm" className="shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                                    File Your Report
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                        <Link href="/" className="flex items-center gap-3 text-sm font-medium hover:bg-muted/50 rounded-lg px-3 py-2.5 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href="/file" className="flex items-center gap-3 text-sm font-medium hover:bg-muted/50 rounded-lg px-3 py-2.5 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                            File Annual Report
                        </Link>
                        {session && (
                            <Link href="/dashboard" className="flex items-center gap-3 text-sm font-medium hover:bg-muted/50 rounded-lg px-3 py-2.5 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                        )}

                        <div className="border-t my-2" />

                        {!session ? (
                            <div className="flex gap-2">
                                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                                </Link>
                                <Link href="/file" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                    <Button size="sm" className="w-full">File Your Report</Button>
                                </Link>
                            </div>
                        ) : (
                            <button
                                className="flex items-center gap-3 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg px-3 py-2.5 transition-colors text-left"
                                onClick={() => { signOut({ callbackUrl: "/login" }); setMobileMenuOpen(false); }}
                            >
                                <LogOut className="w-4 h-4" />
                                Log out
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
