import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError(true);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center mb-4">
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-primary drop-shadow-[0_0_8px_rgba(164,66,42,0.3)]">
            <polygon points="50,0 52,38 85,15 62,48 100,50 62,52 85,85 52,62 50,100 48,62 15,85 38,52 0,50 38,48 15,15 48,38" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif tracking-widest text-primary uppercase">Rito e Raiz</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">Gestão Mística & Artesanal</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>Insira seu usuário e senha para acessar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Usuário (ex: admin)" 
                className="pl-9"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
              />
            </div>
            <div className="space-y-2 relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Senha (ex: 123)" 
                className="pl-9"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">Credenciais incorretas. Tente novamente.</p>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Entrar no Sistema</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
