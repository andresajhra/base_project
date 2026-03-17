import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  expandedItems: string[]; // IDs de items con hijos abiertos

  // Actions
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  toggleItem: (id: string) => void;
  isItemExpanded: (id: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      expandedItems: [],

      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      collapse: () => set({ isCollapsed: true }),
      expand: () => set({ isCollapsed: false }),

      toggleItem: (id) =>
        set((s) => ({
          expandedItems: s.expandedItems.includes(id)
            ? s.expandedItems.filter((i) => i !== id)
            : [...s.expandedItems, id],
        })),

      isItemExpanded: (id) => get().expandedItems.includes(id),
    }),
    { name: "sidebar-storage" }
  )
);
