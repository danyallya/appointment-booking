import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
export const viewport: Viewport = { themeColor: "#f7f2ec", width: "device-width", initialScale: 1 };
export const metadata: Metadata = { title: "Aurelle | Appointment Studio", description: "A considered appointment experience for independent care and beauty studios.", applicationName: "Aurelle", manifest: "/manifest.webmanifest" };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/>{children}</body></html>; }
