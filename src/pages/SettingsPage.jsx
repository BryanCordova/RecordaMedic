import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/lib/auth';
import { Input } from "@/components/ui/input";

const SettingsPage = ({ onBack, isAdmin }) => {
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  // Estado para edición de datos
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
  const [msg, setMsg] = useState("");

  // Guardar cambios de usuario
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!username || !email) {
      setMsg("Nombre y correo son obligatorios.");
      return;
    }
    // Actualizar usuario en localStorage
    const users = JSON.parse(localStorage.getItem('recordaMedic_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].username = username;
      users[idx].email = email;
      localStorage.setItem('recordaMedic_users', JSON.stringify(users));
      localStorage.setItem('recordaMedic_currentUser', JSON.stringify({ ...user, username, email }));
      setMsg("Datos actualizados correctamente.");
    }
  };

  // Cambiar contraseña
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!password || !newPassword) {
      setMsg("Debes ingresar la contraseña actual y la nueva.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('recordaMedic_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1 && users[idx].password === password) {
      users[idx].password = newPassword;
      localStorage.setItem('recordaMedic_users', JSON.stringify(users));
      setMsg("Contraseña cambiada correctamente.");
      setPassword(""); setNewPassword("");
    } else {
      setMsg("Contraseña actual incorrecta.");
    }
  };

  // Cambiar tamaño de fuente
  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    localStorage.setItem('fontSize', e.target.value);
    document.documentElement.style.fontSize = e.target.value === 'large' ? '20px' : e.target.value === 'xlarge' ? '24px' : '16px';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-primary pt-8">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-extrabold gradient-text flex items-center">
              Configuración
            </CardTitle>
            {isAdmin && onBack && (
              <Button variant="outline" onClick={onBack} className="ml-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            )}
          </div>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Personaliza la apariencia de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-muted/20">
            <div className="flex items-center space-x-3">
              {theme === 'light' ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-blue-400" />}
              <Label htmlFor="theme-switch" className="text-lg font-medium text-foreground">
                Tema de la Aplicación
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>
                Claro
              </span>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Cambiar tema"
              />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>
                Oscuro
              </span>
            </div>
          </div>
          {/* Edición de datos */}
          <form onSubmit={handleSaveProfile} className="space-y-4 p-4 border rounded-lg shadow-sm bg-muted/20">
            <h3 className="font-semibold text-lg mb-2">Editar Datos de Usuario</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="username">Nombre</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="flex-1">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="mt-2">Guardar Cambios</Button>
          </form>
          {/* Cambiar contraseña */}
          <form onSubmit={handleChangePassword} className="space-y-4 p-4 border rounded-lg shadow-sm bg-muted/20">
            <h3 className="font-semibold text-lg mb-2">Cambiar Contraseña</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="password">Contraseña Actual</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="flex-1">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="mt-2">Cambiar Contraseña</Button>
          </form>
          {/* Tamaño de fuente */}
          <div className="p-4 border rounded-lg shadow-sm bg-muted/20">
            <h3 className="font-semibold text-lg mb-2">Tamaño de Fuente</h3>
            <div className="flex gap-4 items-center">
              <Label htmlFor="fontSize">Selecciona el tamaño de letra:</Label>
              <select id="fontSize" value={fontSize} onChange={handleFontSizeChange} className="border rounded px-2 py-1">
                <option value="medium">Normal</option>
                <option value="large">Grande</option>
                <option value="xlarge">Muy Grande</option>
              </select>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">Ideal para personas adultas o con dificultades visuales.</p>
          </div>
          {msg && <div className="text-center text-sm text-primary font-semibold pt-2">{msg}</div>}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p> </p>
          </div>
        </CardContent>
        {isAdmin && onBack && (
           <CardFooter className="p-6 border-t">
             <Button variant="ghost" onClick={onBack} className="w-full text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir al Panel de Administración
             </Button>
           </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default SettingsPage;