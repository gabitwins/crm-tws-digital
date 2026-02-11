'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook, Linkedin } from 'lucide-react';

interface LoginFormProps {
    onSubmit: (email: string, password: string, remember: boolean) => void;
    isSubmitting?: boolean;
    error?: string;
}

interface VideoBackgroundProps {
    videoUrl: string;
}

interface FormInputProps {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

interface SocialButtonProps {
    icon: React.ReactNode;
    name: string;
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    id: string;
}

// FormInput Component
const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full pl-10 pr-3 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
            />
        </div>
    );
};

// SocialButton Component
const SocialButton: React.FC<SocialButtonProps> = ({ icon }) => {
    return (
        <button type="button" className="flex items-center justify-center p-3 bg-white/20 border border-white/30 rounded-xl text-white hover:bg-white/30 hover:border-white/40 transition-all backdrop-blur-sm">
            {icon}
        </button>
    );
};

// ToggleSwitch Component
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
    return (
        <div className="relative inline-block w-10 h-5 cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-white' : 'bg-white/30'}`}>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full ${checked ? 'bg-blue-600' : 'bg-white'} transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-5' : ''}`} />
            </div>
        </div>
    );
};

// VideoBackground Component
const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-800/80 to-navy-900/90 z-10" />
            <video
                ref={videoRef}
                className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

// Main LoginForm Component
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting = false, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password, remember);
    };

    return (
        <div className="p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <div className="mb-8 text-center">
                <div className="mb-6 flex justify-center">
                    <img src="/logo.png" alt="NEXO CRM" className="h-36 md:h-40 w-auto drop-shadow-2xl" />
                </div>
                <p className="text-white flex flex-col items-center space-y-2 mt-6">
                    <span className="relative group cursor-default">
                        <span className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block text-lg font-semibold">Seu sistema operacional inteligente</span>
                    </span>
                    <span className="text-sm text-white/80">
                        Faça o login para acessar o seu CRM
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                    icon={<Mail className="text-white/80" size={20} />}
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="relative">
                    <FormInput
                        icon={<Lock className="text-white/80" size={20} />}
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div onClick={() => setRemember(!remember)} className="cursor-pointer">
                            <ToggleSwitch
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                id="remember-me"
                            />
                        </div>
                        <label
                            htmlFor="remember-me"
                            className="text-sm text-white/90 cursor-pointer hover:text-white transition-colors"
                            onClick={() => setRemember(!remember)}
                        >
                            Lembrar de mim
                        </label>
                    </div>
                    <a href="#" className="text-sm text-white/90 hover:text-white transition-colors font-medium">
                        Esqueceu a senha?
                    </a>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-white text-center">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-xl ${isSuccess
                            ? 'bg-green-600'
                            : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                        } text-white font-semibold transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl border border-white/30`}
                >
                    {isSubmitting ? 'Entrando...' : 'Acessar CRM'}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/20 absolute w-full"></div>
                    <div className="bg-transparent px-4 relative text-white/70 text-sm">
                        ou continue com
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <SocialButton icon={<Chrome size={20} />} name="Google" />
                    <SocialButton icon={<Facebook size={20} />} name="Facebook" />
                    <SocialButton icon={<Linkedin size={20} />} name="LinkedIn" />
                </div>
            </div>

            <p className="mt-6 text-center text-sm text-white/80">
                Não tem uma conta?{' '}
                <a href="#" className="font-semibold text-white hover:text-white/90 transition-colors underline">
                    Criar conta
                </a>
            </p>

            <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                    Email demo: <span className="text-white font-medium">admin@crm.com</span> | Senha: <span className="text-white font-medium">admin123</span>
                </p>
            </div>
        </div>
    );
};

// Export as default components
const LoginPage = {
    LoginForm,
    VideoBackground
};

export default LoginPage;
