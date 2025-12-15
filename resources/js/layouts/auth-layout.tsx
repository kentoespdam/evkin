import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";
import { useErrorToast } from "@/hooks/use-error-toast";

export default function AuthLayout({
  children,
  title,
  description,
  ...props
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  useErrorToast();

  return (
    <AuthLayoutTemplate title={title} description={description} {...props}>
      {children}
    </AuthLayoutTemplate>
  );
}
