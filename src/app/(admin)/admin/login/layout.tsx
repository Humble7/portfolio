export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login has its own layout without the sidebar
  return <>{children}</>;
}
