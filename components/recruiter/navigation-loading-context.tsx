'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationLoadingContextType {
    isNavigating: boolean;
    setNavigating: (value: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
    const [isNavigating, setNavigating] = useState(false);

    return (
        <NavigationLoadingContext.Provider value={{ isNavigating, setNavigating }}>
            {children}
        </NavigationLoadingContext.Provider>
    );
}

export function useNavigationLoading() {
    const context = useContext(NavigationLoadingContext);
    if (context === undefined) {
        throw new Error('useNavigationLoading must be used within a NavigationLoadingProvider');
    }
    return context;
}

