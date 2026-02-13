import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { error } = await signup(email, password);
      if (error) throw error;
      
      toast({
        title: 'Account created successfully',
        description: 'Welcome to Invoque!',
      });
      
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to get started"
      illustration="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_1.png"
      illustrationAlt="abstract signup illustration"
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
        
        <FloatingLabelInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isPending}
        />
        
        <FloatingLabelInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
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
          {isPending ? 'Creating account...' : 'Sign Up'}
        </Button>
        
        <p className="text-center text-body-sm text-foreground">
          Already have an account?{' '}
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