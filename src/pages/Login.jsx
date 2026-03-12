import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* LADO IZQUIERDO (BRANDING) */}
      <div className="hidden lg:flex flex-1 items-center justify-center text-white p-12">

        <div className="max-w-md space-y-6">

          <img
            src="/assets/performance.svg"
            alt="NTT"
            className="w-20"
          />

          <h1 className="text-4xl font-black leading-tight">
            Performance
            <span className="block text-blue-400">
              Testing Hub
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Plataforma interna para análisis, generación y gestión
            de pruebas de performance dentro de tu empresa.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-6">

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              ⚡ JMeter Tools
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              📊 Performance Reports
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              🧪 Test Generators
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              📚 Knowledge Base
            </div>

          </div>

        </div>

      </div>

      {/* LOGIN */}
      <div className="flex flex-1 items-center justify-center p-6">

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 space-y-8">

          {/* HEADER */}
          <div className="text-center space-y-3">

            <div className="w-14 h-14 mx-auto">
              <img
                src="/assets/performance.svg"
                alt="NTT"
                className="w-full"
              />
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Performance Hub
            </h2>

            <p className="text-sm text-slate-500">
              Inicia sesión con tu cuenta corporativa
            </p>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-1">

              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                Email Corporativo
              </label>

              <div className="relative">

                <Mail
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="space-y-1">

              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">
                Contraseña
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>

          </form>

          {/* FOOTER */}
          <p className="text-center text-xs text-slate-400">
            Performance Hub · Camilo Gantiva
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;