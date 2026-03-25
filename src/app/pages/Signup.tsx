import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../utils/supabase';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      // Sign up directly through Supabase Auth
      console.log('Creating user account with Supabase Auth...');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message === 'User already registered' 
          ? 'Пользователь с таким email уже зарегистрирован'
          : signUpError.message || 'Произошла ошибка при регистрации');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('User account created successfully:', data.user.id);
        
        // Check if user is already confirmed or needs email confirmation
        if (data.session) {
          console.log('User is logged in, redirecting to dashboard');
          // User is automatically logged in
          navigate('/');
        } else {
          // Email confirmation required (if email provider is configured)
          console.log('Account created. Check your email for confirmation.');
          setSuccess('Аккаунт успешно создан! Проверьте вашу почту для подтверждения email. После подтверждения вы сможете войти в систему.');
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        }
      }
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      setError(err.message || 'Произошла неожиданная ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Theme Toggle in top-right corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 whitespace-nowrap"
            >
              SubManager
            </motion.h1>
            <p className="text-muted-foreground">{t('createAccount')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded-lg text-sm bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 border rounded-lg text-sm bg-success/10 border-success/20 text-success flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t('name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '...' : t('createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}