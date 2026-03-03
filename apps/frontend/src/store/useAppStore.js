import { create } from 'zustand'

export const useAppStore = create((set) => ({
    // UI State
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    // Global Search State
    globalSearchQuery: '',
    setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
    
    // We can add more global states here as needed (e.g., theme, active modals, etc)
}))
