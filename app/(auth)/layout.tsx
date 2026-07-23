import { BRAND_NAME } from "@/lib/constants";

export const metadata = {
  title: `Account | ${BRAND_NAME}`,
};

/** Auth pages: no shop header/footer — clean standalone login/register */
export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      {children}
    </div>
  );
}
