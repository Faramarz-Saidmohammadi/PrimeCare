import Link from "next/link";
import { Icon } from "@/components/Icon";

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`logo ${light ? "logo-light" : ""}`} aria-label="PrimeCare home"><span className="logo-mark"><Icon name="tooth" size={25}/></span><span>Prime<span>Care</span></span></Link>;
}
