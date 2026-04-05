import { redirect } from "next/navigation";

export default function AuthPage() {
    redirect("/shop/auth/login");
}
