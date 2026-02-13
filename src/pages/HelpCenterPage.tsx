import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import { useMutation } from '@animaapp/playground-react-sdk';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const realMutation = isMockMode() ? null : useMutation('HelpRequest');
  const mockMutation = isMockMode() ? useMockMutation('HelpRequest') : null;
  const { create, isPending } = (isMockMode() ? mockMutation : realMutation)!;
  const [activeForm, setActiveForm] = useState<'report' | 'contact' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [reportForm, setReportForm] = useState({ email: '', message: '' });
  const [contactForm, setContactForm] = useState({ email: '', message: '' });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await create({
        email: reportForm.email,
        message: reportForm.message,
        type: 'report_problem',
      });
      
      setShowSuccess(true);
      setReportForm({ email: '', message: '' });
      
      // Keep success message visible longer or until user navigates away
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await create({
        email: contactForm.email,
        message: contactForm.message,
        type: 'contact_us',
      });
      
      setShowSuccess(true);
      setContactForm({ email: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    }
  };

  if (showSuccess) {
    return (
      <InstagramLayout>
        <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
          <div className="bg-background border border-border rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
            <h2 className="text-h2 font-semibold text-foreground mb-3">
              Thank you for your message
            </h2>
            <p className="text-body text-tertiary-foreground mb-6">
              An agent will reply to you by email within 24–72 hours.
            </p>
            <Button 
              onClick={() => {
                setShowSuccess(false);
                setActiveForm(null);
              }}
              className="bg-gradient-primary text-primary-foreground"
            >
              Return to Help Center
            </Button>
          </div>
        </div>
      </InstagramLayout>
    );
  }

  if (activeForm === 'report') {
    return (
      <InstagramLayout>
        <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
          <button
            onClick={() => setActiveForm(null)}
            className="text-body text-primary hover:text-primary-hover mb-4"
          >
            ← Back to Help Center
          </button>
          
          <h1 className="text-h1 font-bold text-foreground mb-2">Report a Problem</h1>
          <p className="text-body text-tertiary-foreground mb-8">
            Let us know what issue you're experiencing
          </p>

          <form onSubmit={handleReportSubmit} className="bg-background border border-border rounded-lg p-6 space-y-6">
            <div>
              <Label htmlFor="report-email" className="text-body-sm font-semibold text-foreground mb-2 block">
                Email Address *
              </Label>
              <Input
                id="report-email"
                type="email"
                value={reportForm.email}
                onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                placeholder="your.email@example.com"
                className="h-10"
                required
              />
            </div>

            <div>
              <Label htmlFor="report-message" className="text-body-sm font-semibold text-foreground mb-2 block">
                Describe the Problem *
              </Label>
              <textarea
                id="report-message"
                value={reportForm.message}
                onChange={(e) => setReportForm({ ...reportForm, message: e.target.value })}
                placeholder="Please describe the issue you're experiencing..."
                className="w-full min-h-32 px-4 py-3 border border-border rounded-md bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-normal resize-none"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                {isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveForm(null)}
                className="h-12 px-8 border-border hover:bg-tertiary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </InstagramLayout>
    );
  }

  if (activeForm === 'contact') {
    return (
      <InstagramLayout>
        <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
          <button
            onClick={() => setActiveForm(null)}
            className="text-body text-primary hover:text-primary-hover mb-4"
          >
            ← Back to Help Center
          </button>
          
          <h1 className="text-h1 font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-body text-tertiary-foreground mb-8">
            Send us a message and we'll get back to you soon
          </p>

          <form onSubmit={handleContactSubmit} className="bg-background border border-border rounded-lg p-6 space-y-6">
            <div>
              <Label htmlFor="contact-email" className="text-body-sm font-semibold text-foreground mb-2 block">
                Email Address *
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="your.email@example.com"
                className="h-10"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact-message" className="text-body-sm font-semibold text-foreground mb-2 block">
                Your Message *
              </Label>
              <textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full min-h-32 px-4 py-3 border border-border rounded-md bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-normal resize-none"
                required
              />
            </div>

            <div className="p-3 bg-tertiary rounded-lg flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-body-sm text-foreground">
                Your message will be sent to <strong>invoque.art@gmail.com</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                {isPending ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveForm(null)}
                className="h-12 px-8 border-border hover:bg-tertiary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </InstagramLayout>
    );
  }

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-2">Help Center</h1>
        <p className="text-body text-tertiary-foreground mb-8">
          How can we help you today?
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setActiveForm('report')}
            className="w-full bg-background border border-border rounded-lg p-6 hover:bg-tertiary transition-colors text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-error" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold text-foreground mb-2">
                  Report a Problem
                </h3>
                <p className="text-body text-tertiary-foreground">
                  Let us know if you're experiencing technical issues or bugs
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveForm('contact')}
            className="w-full bg-background border border-border rounded-lg p-6 hover:bg-tertiary transition-colors text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold text-foreground mb-2">
                  Contact Us
                </h3>
                <p className="text-body text-tertiary-foreground">
                  Send us a message for general inquiries or feedback
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </InstagramLayout>
  );
}
