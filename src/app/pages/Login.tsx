import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../utils/supabase';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const navigate = useNavigate();
  const { t } = useApp();

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Введите email для повторной отправки письма');
      return;
    }

    setIsLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        console.error('Resend error:', resendError);
        setError('Не удалось отправить письмо. Ппробуйте позже.');
      } else {
        setResendSuccess(true);
        setShowResendButton(false);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Произошла ошибка при отправке письма');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Try Supabase auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Suppress console error logging for invalid credentials (expected during development)
        if (signInError.message !== 'Invalid login credentials') {
          console.error('Login error:', signInError);
        }
        
        // Translate error messages to Russian
        let errorMessage = 'Неверный email или пароль';
        
        if (signInError.message === 'Email not confirmed') {
          errorMessage = 'Email не подтверждён. Проверьте вашу почту.';
          setShowResendButton(true);
        } else if (signInError.message === 'Invalid login credentials') {
          errorMessage = 'Неверный email или пароль';
        } else if (signInError.message.includes('not confirmed')) {
          errorMessage = 'Email не подтверждён. Проверьте вашу почту.';
          setShowResendButton(true);
        }
        
        setError(errorMessage);
        return;
      }

      if (data.session) {
        console.log('Login successful, redirecting to dashboard');
        // Navigate to dashboard (AppContext will handle the session)
        navigate('/');
      }
    } catch (err: any) {
      // Suppress console error logging for expected auth errors
      if (!err.message?.includes('Invalid login credentials')) {
        console.error('Login error:', err);
      }
      setError('Произошла ошибка при входе. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Theme Toggle and Language Selector in top-right corner */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <LanguageSelector />
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
              className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 whitespace-nowrap text-[35px]"
            >
              SubManager
            </motion.h1>
            <p className="text-muted-foreground">{t('signIn')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Письмо успешно отправлено. Проверьте вашу почту.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '...' : t('signIn')}
            </button>
          </form>

          {showResendButton && (
            <div className="mt-4 text-center">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendConfirmation}
                className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                {isLoading ? '...' : 'Отправить письмо повторно'}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}