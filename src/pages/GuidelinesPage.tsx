import InstagramLayout from '@/components/InstagramLayout';

export default function GuidelinesPage() {
  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-2">Community Guidelines</h1>
        <p className="text-body text-tertiary-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-background border border-border rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">Our Mission</h2>
            <p className="text-body text-foreground leading-relaxed">
              Invoque is a platform for creative expression, connection, and community. These guidelines help ensure our community remains safe, respectful, and inspiring for everyone.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">1. Be Respectful</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Treat others with kindness and respect. We do not tolerate:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Harassment, bullying, or intimidation</li>
              <li>Hate speech or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
              <li>Threats of violence or harm</li>
              <li>Doxxing or sharing private information without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">2. Share Authentic Content</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Post content that is genuine and represents your creative work:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Do not impersonate others or misrepresent your identity</li>
              <li>Give credit to original creators when sharing others' work</li>
              <li>Do not post spam, misleading content, or engage in manipulation</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">3. Keep Content Appropriate</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Maintain a safe environment for all users:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>No explicit sexual content or nudity</li>
              <li>No graphic violence or gore</li>
              <li>No content promoting self-harm or dangerous activities</li>
              <li>No illegal activities or regulated goods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">4. Protect Privacy</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Respect the privacy of others:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Do not share others' personal information without permission</li>
              <li>Respect content visibility settings (public vs. friends-only)</li>
              <li>Do not screenshot or share private messages without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">5. Foster Positive Interactions</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Help build a supportive community:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Provide constructive feedback and encouragement</li>
              <li>Celebrate diverse perspectives and creative styles</li>
              <li>Report content that violates these guidelines</li>
              <li>Use blocking and muting features to curate your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Respect copyright and creative rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Only post content you have the right to share</li>
              <li>Properly attribute and credit original creators</li>
              <li>Respond to copyright claims promptly</li>
              <li>Do not use others' work for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">7. Platform Integrity</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Help maintain a healthy platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Do not create fake accounts or engage in coordinated inauthentic behavior</li>
              <li>Do not artificially inflate engagement (likes, follows, etc.)</li>
              <li>Do not attempt to access others' accounts or exploit vulnerabilities</li>
              <li>Do not interfere with the platform's functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">Enforcement</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              Violations of these guidelines may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Content removal</li>
              <li>Temporary account restrictions</li>
              <li>Permanent account suspension</li>
              <li>Legal action in severe cases</li>
            </ul>
            <p className="text-body text-foreground leading-relaxed mt-3">
              We review reports promptly and fairly. You may appeal enforcement decisions through our support channels.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">Reporting</h2>
            <p className="text-body text-foreground leading-relaxed">
              If you see content that violates these guidelines, please report it using the report button on posts, comments, or profiles. You can also contact us at support@invoque.art for urgent safety concerns.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">Updates</h2>
            <p className="text-body text-foreground leading-relaxed">
              We may update these guidelines as our community evolves. Continued use of Invoque constitutes acceptance of the current guidelines.
            </p>
          </section>
        </div>
      </div>
    </InstagramLayout>
  );
}
