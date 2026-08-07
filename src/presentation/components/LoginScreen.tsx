import React, { useState } from 'react';
import { AuthService } from '../../services/AuthService';

interface LoginScreenProps {
  onLoginSuccess: (email: string, role: 'admin' | 'user') => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (isRegisterMode) {
      // Fluxo de Cadastro
      if (!name.trim()) {
        setErrorMsg('Por favor, insira o seu nome.');
        setIsLoading(false);
        return;
      }
      if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
        setErrorMsg('Por favor, insira um e-mail válido.');
        setIsLoading(false);
        return;
      }
      if (!whatsapp.trim()) {
        setErrorMsg('Por favor, insira um WhatsApp válido.');
        setIsLoading(false);
        return;
      }
      if (password.length < 4) {
        setErrorMsg('A senha deve ter no mínimo 4 caracteres.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        setIsLoading(false);
        return;
      }

      const regResult = await AuthService.registerUser(trimmedEmail, password, name, whatsapp);
      setIsLoading(false);

      if (regResult.success) {
        setSuccessMsg('Conta criada com sucesso! Faça login abaixo.');
        setIsRegisterMode(false);
        setPassword('');
        setConfirmPassword('');
        setWhatsapp('');
      } else {
        setErrorMsg(regResult.message);
      }
    } else {
      // Fluxo de Login
      // Simulate small latency for realistic loading experience
      setTimeout(() => {
        setIsLoading(false);
        // Credenciais do Administrador
        if (trimmedEmail === 'nogueiralfha@gmail.com') {
          if (password === 'missionario405') {
            AuthService.saveSession(trimmedEmail, 'admin', 'Administrador');
            onLoginSuccess(trimmedEmail, 'admin');
          } else {
            setErrorMsg('Senha incorreta para a conta de administrador.');
          }
        } else {
          // Usuários Registrados
          const users = AuthService.getRegisteredUsers();
          const foundUser = users.find(u => u.email === trimmedEmail);
          
          if (foundUser) {
            const hash = AuthService.hashPassword(password);
            if (foundUser.passwordHash === hash) {
              AuthService.saveSession(trimmedEmail, 'user', foundUser.name);
              onLoginSuccess(trimmedEmail, 'user');
            } else {
              setErrorMsg('Senha incorreta.');
            }
          } else {
            setErrorMsg('Este e-mail não está cadastrado. Clique em "Cadastrar-se" para criar uma conta.');
          }
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Decorative Blobs */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl flex flex-col justify-between">
        
        {/* Back link */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          ← Voltar ao Início
        </button>

        <div className="mt-4">
          {/* Logo / Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-md shadow-amber-300/40 flex items-center justify-center text-white font-black text-2xl font-serif mx-auto mb-4">
              T
            </div>
            <h2 className="text-2xl font-black text-slate-800 font-serif">
              {isRegisterMode ? 'Criar sua Conta' : 'Entrar na Plataforma'}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-semibold">
              {isRegisterMode ? 'Comece a criar histórias personalizadas com IA' : 'Crie histórias incríveis com Inteligência Artificial'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                🎉 {successMsg}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Name Field (Register mode only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Seu Nome</label>
                <input 
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Endereço de E-mail</label>
              <input 
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* WhatsApp Field (Register mode only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Número de WhatsApp</label>
                <input 
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
                />
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Confirm Password Field (Register mode only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirmar Senha</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 focus:border-amber-500 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-101 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processando...
                </>
              ) : (
                isRegisterMode ? 'Criar Conta' : 'Acessar Estúdio'
              )}
            </button>
          </form>

          {/* Toggle Register/Login Link */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
            >
              {isRegisterMode ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastrar-se'}
            </button>
          </div>
        </div>

        {/* Small Notice */}
        <div className="text-center text-[10px] text-slate-400 mt-8 font-semibold border-t border-slate-100/50 pt-4">
          Conexão segura SSL de ponta a ponta com o estúdio
        </div>

      </div>
    </div>
  );
};
