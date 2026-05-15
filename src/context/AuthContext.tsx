import React, { createContext, useContext, useState, useEffect } from 'react';

function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

type User = {
  id: string;
  name: string;
  username: string; // new
  password?: string; // storing in memory to simulate
  role: string;
  permissions: string[]; // new
};

type AuthContextType = {
  user: User | null;
  usersList: User[];
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  createUser: (name: string, username: string, role: string, permissions: string[]) => void;
  deleteUser: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = usePersistedState<User | null>('erp_current_user', null);
  const [usersList, setUsersList] = usePersistedState<User[]>('erp_users', [
    { id: '1', name: 'Administrador', username: 'admin', password: '123', role: 'admin', permissions: ['dashboard', 'sales', 'crm', 'spells', 'inventory', 'calendar', 'shipping', 'config'] },
    { id: '2', name: 'Atendente', username: 'user', password: '123', role: 'user', permissions: ['dashboard', 'sales', 'crm', 'calendar'] },
  ]);

  const login = (username: string, password: string) => {
    const foundUser = usersList.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) {
      setUser({ ...user!, ...updates });
    }
  };

  const createUser = (name: string, username: string, role: string, permissions: string[]) => {
    const newUser: User = { id: String(Date.now()), name, username, password: '123', role, permissions };
    setUsersList([...usersList, newUser]);
  };

  const deleteUser = (id: string) => {
    if (usersList.length > 1) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  return (
    <AuthContext.Provider value={{ user, usersList, setUsersList, login, logout, updateUser, createUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
