import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Karim Khaled | Software Engineer & Creative Developer",
  description: "Digital portfolio of Karim Khaled, featuring interactive web experiences, 3D designs, and modern frontend development.",
};

export default function Page() {
  return <PageClient />;
}

