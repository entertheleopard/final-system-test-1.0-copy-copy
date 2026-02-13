import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await login(email, password);
      if (error) throw error;
      
      toast({
        title: 'Welcome back',
        description: 'You have successfully signed in.',
      });
      navigate('/ladder');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      illustration="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_2.png"
      illustrationAlt="abstract login illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingLabelInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isLoading}
        />

        <FloatingLabelInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-normal shadow-button-primary hover:bg-primary-hover transition-all duration-normal ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="text-body-sm text-primary hover:underline transition-colors duration-normal"
          >
            Forgot password?
          </Link>
        </div>
        
        <p className="text-center text-body-sm text-foreground">
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            className="text-primary hover:underline transition-colors duration-normal"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
