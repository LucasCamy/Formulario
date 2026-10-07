import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UsuarioDto } from "./tipos";

interface EstadoAuth {
  token: string | null;
  usuario: UsuarioDto | null;
  setAuth: (token: string, usuario: UsuarioDto) => void;
  logout: () => void;
  estaAutenticado: () => boolean;
  ehAdmin: () => boolean;
}

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
      estaAutenticado: () => Boolean(get().token),
      ehAdmin: () => get().usuario?.ehAdmin === true,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({
        token: estado.token,
        usuario: estado.usuario,
      }),
    },
  ),
);
