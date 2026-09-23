import { isStaffAuthenticated } from "@/lib/staff-auth";
import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { StaffLogin } from "@/components/staff/staff-login";
import { BenchMapEditor } from "@/components/staff/bench-map-editor";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  return (await isStaffAuthenticated()) ? (
    <>
      <BenchMapEditor />
      <StaffDashboard />
    </>
  ) : (
    <StaffLogin />
  );
}
