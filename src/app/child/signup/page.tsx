"use client";
import { useRouter } from "next/navigation";
import { ChildSignupScreen, type ChildProfile } from "@/components/screens/ChildSignupScreen";

export default function ChildSignupPage() {
  const router = useRouter();

  const handleComplete = (profile: ChildProfile) => {
    // Save child's profile (interests, avatar, color) to localStorage
    localStorage.setItem("nara_child_profile", JSON.stringify(profile));
    router.push("/child/home");
  };

  return (
    <ChildSignupScreen
      onBack={() => router.back()}
      onComplete={handleComplete}
    />
  );
}
