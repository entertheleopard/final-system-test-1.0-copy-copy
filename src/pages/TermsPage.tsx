import InstagramLayout from '@/components/InstagramLayout';

export default function TermsPage() {
  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-body text-tertiary-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-background border border-border rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-body text-foreground leading-relaxed">
              By accessing and using Invoque ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">2. Use of Service</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Invoque is a social platform for creative expression and community building. You agree to use the Service only for lawful purposes and in accordance with these Terms.
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>You must be at least 13 years old to use this Service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not use the Service for any illegal or unauthorized purpose</li>
              <li>You must not transmit any worms, viruses, or destructive code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">3. User Content</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              You retain all rights to the content you post on Invoque. By posting content, you grant Invoque a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the platform.
            </p>
            <p className="text-body text-foreground leading-relaxed">
              You are solely responsible for the content you post and must ensure you have all necessary rights and permissions.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">4. Privacy</h2>
            <p className="text-body text-foreground leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">5. Prohibited Conduct</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Harassing, threatening, or intimidating other users</li>
              <li>Posting content that is illegal, harmful, or offensive</li>
              <li>Impersonating another person or entity</li>
              <li>Attempting to gain unauthorized access to the Service</li>
              <li>Interfering with the proper functioning of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p className="text-body text-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by Invoque and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">7. Termination</h2>
            <p className="text-body text-foreground leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p className="text-body text-foreground leading-relaxed">
              Invoque shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">9. Changes to Terms</h2>
            <p className="text-body text-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-body text-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at legal@invoque.art
            </p>
          </section>
        </div>
      </div>
    </InstagramLayout>
  );
}
