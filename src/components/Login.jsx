import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Loader2, LogIn, Shield } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      // Redirigir automáticamente
    }
    setLoading(false);
  };

  if (currentUser) {
    return null; // Ya está autenticado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Piscinas Durán
          </h1>
          <p className="text-gray-600">
            Sistema de Gestión Profesional
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="font-medium">
              {loading ? 'Iniciando sesión...' : 'Iniciar con Google'}
            </span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Construcción, Mantenimiento & Reparaciones de Piscinas Durán
          </p>
        </div>
      </div>
    </div>
  );
}