import { AuthGuard } from "@/components/AuthGuard";
import { FamilyTreeCanvas } from "@/components/FamilyTreeCanvas";

export default function Home() {
  return (
    <AuthGuard>
      <FamilyTreeCanvas />
    </AuthGuard>
  );
}
