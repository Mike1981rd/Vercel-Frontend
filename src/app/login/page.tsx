'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import authService from '@/services/auth.service';
import { localAuthService } from '@/services/local-auth.service';
import { useI18n } from '@/contexts/I18nContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Eye, EyeOff, Languages } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaGithub, FaGoogle } from 'react-icons/fa';
import { buildAssetUrl } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const [companyConfig, setCompanyConfig] = useState<{ name?: string; logo?: string; logoSize?: number } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);


  // Load company configuration
  useEffect(() => {
    const loadCompanyConfig = async () => {
      try {
        const response = await api.get('/company/config');
        setCompanyConfig(response.data as any);
      } catch (error) {
        console.error('Error loading company config:', error);
        // Continue without company config
      } finally {
        // Mark initialization as complete after loading config
        setIsInitializing(false);
      }
    };
    
    loadCompanyConfig();
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Normalizar entradas
      // No forzar minúsculas: el backend compara el email exactamente contra lo almacenado.
      const emailNorm = (email || '').trim();
      const passwordNorm = (password || '').trim();

      if (!emailNorm || !passwordNorm) {
        throw new Error(t('auth.missingCredentials', 'Please enter email and password'));
      }

      // Login directo con el backend (sin Supabase)
      const authResponse = await localAuthService.login({
        email: emailNorm,
        password: passwordNorm
      });
      
      // Guardar la autenticación
      authService.saveAuth(authResponse);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(t('auth.defaultError'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen message="Initializing..." showLogo={false} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Theme Toggle and Language Selector */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        {/* Language Selector */}
        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
          >
            <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={() => {
                  setLanguage('es');
                  setShowLanguageMenu(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                  language === 'es' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">🇩🇴</span>
                <span className="text-sm">{t('theme.spanish')}</span>
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLanguageMenu(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                  language === 'en' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">🇺🇸</span>
                <span className="text-sm">{t('theme.english')}</span>
              </button>
            </div>
          )}
        </div>
        
        <ThemeToggle />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 opacity-50"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-sm mx-4">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 space-y-4 transition-all duration-300">
          
          {/* Logo */}
          <div className="flex justify-center">
            {companyConfig?.logo && buildAssetUrl(companyConfig.logo) ? (
              <div 
                className="relative rounded-xl overflow-hidden"
                style={{ 
                  // Scale logo size for login page (slightly larger than sidebar)
                  width: `${Math.round((companyConfig.logoSize || 120) * 0.5)}px`, 
                  height: `${Math.round((companyConfig.logoSize || 120) * 0.5)}px` 
                }}
              >
                <Image 
                  src={buildAssetUrl(companyConfig.logo)!} 
                  alt={companyConfig.name || 'Company Logo'} 
                  fill
                  className="object-contain"
                  sizes={`${Math.round((companyConfig.logoSize || 120) * 0.5)}px`}
                />
              </div>
            ) : (
              <div 
                className="bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center"
                style={{ 
                  width: '60px', 
                  height: '60px' 
                }}
              >
                {companyConfig?.name ? (
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                    {companyConfig.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <div className="w-10 h-10 bg-primary-500 rounded-lg"></div>
                )}
              </div>
            )}
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('auth.welcomeTitle')}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('auth.welcomeSubtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder={t('auth.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('auth.rememberMe')}
                </span>
              </label>
              
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                href="/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {t('auth.orDivider')}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('auth.socialLogin.facebook')}
            >
              <FaFacebookF className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('auth.socialLogin.twitter')}
            >
              <FaTwitter className="w-4 h-4 text-sky-500" />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('auth.socialLogin.github')}
            >
              <FaGithub className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('auth.socialLogin.google')}
            >
              <FaGoogle className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
