import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PasswordProtectProps {
  children: React.ReactNode;
}

const CORRECT_PASSWORD = 'textback2025';
const PASSWORD_KEY = 'tradietext_auth';

export function PasswordProtect({ children }: PasswordProtectProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem(PASSWORD_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(PASSWORD_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">🚧 Under Construction</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're building something amazing for Australian tradies! 
          Our missed-call management system will help you never lose a customer again.
        </p>
        <p className="text-lg text-gray-500 mt-4">
          Coming soon to revolutionize how tradies handle customer communications.
        </p>
      </div>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-center">Site Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                For authorized access only
              </p>
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Enter Site
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 mt-8">
        © 2025 TradieText - Built with ❤️ in Australia
      </p>
    </div>
  );
}