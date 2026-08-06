import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return <section className="admin-login"><div className="admin-login-card"><span className="eyebrow">Secure administration</span><h1>PrimeCare admin</h1><p>Sign in to manage appointments, messages, clinic settings, and website content.</p><AdminLoginForm/>{process.env.NODE_ENV !== "production" && !process.env.ADMIN_EMAIL && !process.env.ADMIN_PASSWORD ? <small>Development default: admin@primecare.test / PrimeCare123!</small> : null}</div></section>;
}
