import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminSession } from "@/lib/auth";
export const metadata={title:"Admin Dashboard"};
export default async function AdminPage(){const session=await getAdminSession();if(!session)redirect("/admin/login");return <AdminDashboard email={session.email}/>}
