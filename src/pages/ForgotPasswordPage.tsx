import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsPending(true);
    setError(null);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      setEmailSent(true);
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for reset instructions.',
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We sent password reset instructions to ${email}`}
        illustration="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_3.png"
        illustrationAlt="email sent illustration"
      >
        <div className="space-y-6">
          <div className="p-4 bg-tertiary border border-border rounded-md">
            <p className="text-body-sm text-tertiary-foreground">
              If an account exists with this email, you will receive password reset instructions via email shortly.
            </p>
          </div>
          
          <Link
            to="/auth/login"
            className="block w-full text-center h-12 px-6 bg-gradient-primary text-primary-foreground font-normal shadow-button-primary hover:bg-primary-hover transition-all duration-normal ease-in-out hover:scale-[1.02] rounded-md leading-[3rem]"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
      illustration="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_2.png"
      illustrationAlt="password reset illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingLabelInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isPending}
        />
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-body-sm">
            {error.message}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-normal shadow-button-primary hover:bg-primary-hover transition-all duration-normal ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
        
        <p className="text-center text-body-sm text-foreground">
          Remember your password?{' '}
          <Link
            to="/auth/login"
            className="text-primary hover:underline transition-colors duration-normal"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
