// frontend\src\app\components\common\navbar.tsx

'use client'

import { Rocket, LogOut } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

import { useRouter } from "next/navigation";

export default function Navbar() {
    const session = authClient.useSession();
    const router = useRouter();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleDashboardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (session?.data?.user) {
            router.push("/dashboard");
        } else {
            setIsAuthDialogOpen(true);
        }
    };

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    return (
        <>
            <div className="md:fixed top-0 z-50 flex  bg-light/[0.3] backdrop-blur-xl w-full dark:bg-dark/[0.3]  flex-row items-center justify-between py-4 px-7 md:px-16 md:py-6 ">

                <div className="font-primary text-xl md:text-4xl text-dark dark:text-light">
                    {isDark ? (
                        <Rocket className="inline mr-2" size={28} fill="#FFFFF8" />) : (
                        <Rocket className="inline mr-2" size={28} fill="#121212" />
                    )}
                    NEXT HIRE
                </div>
                <div className="font-secondary text-dark dark:text-light text-xs md:text-xl gap-6 md:gap-14 flex flex-row items-center">
                    <a
                        href="/#home"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("home");
                        }}
                        className=" hover:text-primary transition-all duration-200 ease-in"
                    >
                        Home
                    </a>
                    <a
                        href="/whyus"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("whyus");
                        }}
                        className=" hover:text-primary transition-all duration-200 ease-in"
                    >
                        Why Us?
                    </a>
                    <a
                        href="/#queries"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("queries");
                        }}
                        className=" hover:text-primary transition-all duration-200 ease-in"
                    >
                        Queries
                    </a>
                    <a
                        href="/dashboard"
                        onClick={handleDashboardClick}
                        className=" hover:text-primary transition-all duration-200 ease-in">
                        Dashboard
                    </a>

                    <div className="ml-4">
                        {session?.data?.user ? (
                            <div className="flex items-center gap-4">
                                <div className="font-secondary text-sm md:text-lg text-primary">
                                    Welcome, {session.data.user.name || session.data.user.email?.split('@')[0]}!
                                </div>
                                <button
                                    onClick={async () => {
                                        await authClient.signOut();
                                        window.location.reload();
                                    }}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} className="text-dark dark:text-light" />
                                </button>
                            </div>
                        ) : (
                            <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
                        )}
                    </div>
                </div>

            </div>
        </>
    )
}