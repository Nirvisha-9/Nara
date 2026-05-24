"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CrisisModePanel } from "@/components/screens/CrisisModePanel";
import { request } from "@/lib/api/request";

export default function CrisisPage() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null as any);

  useEffect(() => {
    request("/api/children").then((res) => {
      setChildren(res);
      if (res.length > 0) setActiveChild(res[0]);
    });
  }, []);

  if (!activeChild) return null;

  return <CrisisModePanel childId={activeChild.id} childProfile={activeChild} onClose={() => router.back()} />;
}
