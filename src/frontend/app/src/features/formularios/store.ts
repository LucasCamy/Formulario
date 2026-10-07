import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface EstadoBuilderFormulario {
  formularioSelecionadoId?: string;
  versaoEmEdicaoId?: string;
  setFormularioSelecionado: (formularioId?: string) => void;
  setVersaoEmEdicao: (versaoId?: string) => void;
  limpar: () => void;
}

export const useBuilderFormularioStore = create<EstadoBuilderFormulario>()(
  persist(
    (set) => ({
      formularioSelecionadoId: undefined,
      versaoEmEdicaoId: undefined,
      setFormularioSelecionado: (formularioId) =>
        set({
          formularioSelecionadoId: formularioId,
        }),
      setVersaoEmEdicao: (versaoId) =>
        set({
          versaoEmEdicaoId: versaoId,
        }),
      limpar: () =>
        set({
          formularioSelecionadoId: undefined,
          versaoEmEdicaoId: undefined,
        }),
    }),
    {
      name: "builder-formulario-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({
        formularioSelecionadoId: estado.formularioSelecionadoId,
        versaoEmEdicaoId: estado.versaoEmEdicaoId,
      }),
    },
  ),
);
