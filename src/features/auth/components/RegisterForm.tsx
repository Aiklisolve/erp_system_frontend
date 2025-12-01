import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function RegisterForm() {
  const { register, error, loading } = useAuth();
  const [fullName, setFullName] = useState('Demo User');
  const [email, setEmail] = useState('demo@orbieterp.local');
  const [password, setPassword] = useState('password');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await register(email, password, fullName);
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <Input
        label="Full name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-[11px] text-amber-300">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={loading}
      >
        Create account
      </Button>
      <p className="text-[11px] text-slate-400 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
          Sign in
        </Link>
      </p>
    </form>
  );
}


