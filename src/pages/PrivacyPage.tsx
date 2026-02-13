import InstagramLayout from '@/components/InstagramLayout';

export default function PrivacyPage() {
  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-body text-tertiary-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-background border border-border rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              We collect information you provide directly to us when you create an account, post content, or communicate with other users.
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Account information (email, username, profile details)</li>
              <li>Content you post (images, videos, text, comments)</li>
              <li>Usage data (interactions, preferences, device information)</li>
              <li>Communication data (messages, support requests)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience on Invoque</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure the safety and security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">3. Information Sharing</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in operating our platform</li>
              <li>To comply with legal obligations or protect rights and safety</li>
              <li>In connection with a business transaction (merger, acquisition)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">4. Your Privacy Controls</h2>
            <p className="text-body text-foreground leading-relaxed mb-3">
              You have control over your information and privacy settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-body text-foreground ml-4">
              <li>Choose between public and friends-only profile visibility</li>
              <li>Control who can see your posts and stories</li>
              <li>Manage friend requests and connections</li>
              <li>Delete your content or account at any time</li>
              <li>Opt out of certain data collection and communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">5. Data Security</h2>
            <p className="text-body text-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-body text-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">7. Children's Privacy</h2>
            <p className="text-body text-foreground leading-relaxed">
              Invoque is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">8. International Data Transfers</h2>
            <p className="text-body text-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">9. Changes to Privacy Policy</h2>
            <p className="text-body text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-body text-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@invoque.art
            </p>
          </section>
        </div>
      </div>
    </InstagramLayout>
  );
}
