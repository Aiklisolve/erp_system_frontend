import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function LoginForm() {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('demo@orbieterp.local');
  const [password, setPassword] = useState('password');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="space-y-1">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-[11px] text-amber-300">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={loading}
      >
        Sign in
      </Button>
      <p className="text-[11px] text-slate-400 text-center">
        No account?{' '}
        <Link to="/register" className="text-emerald-300 hover:text-emerald-200">
          Create a demo user
        </Link>
      </p>
    </form>
  );
}


