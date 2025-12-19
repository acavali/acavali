import { useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Bike, Lock, Mail } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocalizacao = () => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Tentar obter endereço usando a API de Geocoding do OpenStreetMap
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const geoData = await geoResponse.json();
              resolve({
                latitude,
                longitude,
                endereco: geoData.display_name || `${latitude}, ${longitude}`
              });
            } catch (error) {
              resolve({
                latitude,
                longitude,
                endereco: `${latitude}, ${longitude}`
              });
            }
          },
          (error) => {
            console.log("Geolocalização não disponível:", error);
            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const token = response.data.access_token;
      const user = response.data.user;

      // Registrar presença com localização
      const localizacao = await getLocalizacao();
      
      try {
        await axios.post(
          `${API}/presenca/registrar`,
          {
            usuario_id: user.id,
            tipo: "login",
            localizacao: localizacao
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (locError) {
        console.error("Erro ao registrar localização:", locError);
        // Continua mesmo se falhar o registro de localização
      }

      onLogin(user, token);
      toast.success(t('messages.loginSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || t('messages.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Language Selector in top-right corner */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <Card className="w-full max-w-md shadow-2xl" data-testid="login-card">
        <CardHeader>
          <div>
            <CardTitle className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{t('login.title')}</CardTitle>
            <CardDescription className="text-base">{t('login.subtitle')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  data-testid="email-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('common.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  data-testid="password-input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? t('login.loading') : t('common.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
