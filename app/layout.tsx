import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
export const metadata: Metadata = { title: "Aurelle | Appointment Studio", description: "A considered appointment experience for independent care and beauty studios.", applicationName: "Aurelle", manifest: "/manifest.webmanifest", themeColor: "#f7f2ec" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/>{children}</body></html>; }