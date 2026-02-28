import { useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/auth.service';
import type { User, UserRole, RolePermissions } from '../types';
import { ROLE_PERMISSIONS } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const { user } = await authService.getMe();
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch {
      authService.logout();
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    authService.setToken(response.token);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response;
  };

  const register = async (data: {
    organizationName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await authService.register(data);
    authService.setToken(response.token);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response;
  };

  const logout = () => {
    authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  // Permissions basées sur le rôle
  const permissions: RolePermissions | null = useMemo(() => {
    if (!state.user) return null;
    return ROLE_PERMISSIONS[state.user.role as UserRole];
  }, [state.user]);

  // Helper pour vérifier une permission
  const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] === true;
  }, [permissions]);

  // Helper pour vérifier le rôle
  const hasRole = useCallback((...roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    permissions,
    hasPermission,
    hasRole,
  };
}
