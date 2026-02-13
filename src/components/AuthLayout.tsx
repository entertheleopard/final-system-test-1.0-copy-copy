import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  illustration: string;
  illustrationAlt: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  illustration,
  illustrationAlt,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img
            src={illustration}
            alt={illustrationAlt}
            className="w-full max-w-xs mx-auto mb-6 rounded-lg"
            loading="eager"
          />
          <h1 className="text-h1 font-medium text-foreground tracking-tighter">
            {title}
          </h1>
          <p className="text-body text-tertiary-foreground">
            {subtitle}
          </p>
        </div>
        
        <div className="space-y-6">
          {children}
        </div>
      </section>
    </main>
  );
}