import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    console.log("Dashboard Session:", JSON.stringify(session, null, 2));

    const role = session.user.role || "CLIENT";

    if (role === "ADMIN") {
        redirect("/dashboard/admin")
    } else if (role === "FILER") {
        redirect("/dashboard/filer")
    } else {
        redirect("/dashboard/client")
    }
}
