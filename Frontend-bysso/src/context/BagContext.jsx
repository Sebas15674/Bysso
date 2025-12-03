import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getBagsByStatus } from '../services/pedidosService';

// Función de ordenamiento alfanumérico (ej: '1a' < '1v' < '2a' < '21').
const sortBags = (a, b) => {
    const strA = String(a);
    const strB = String(b);
    
    const regex = /(\d+)([a-z])?/; 
    const matchA = strA.match(regex);
    const matchB = strB.match(regex);

    if (!matchA || !matchB) return 0;

    const numA = parseInt(matchA[1], 10);
    const numB = parseInt(matchB[1], 10);
    const charA = matchA[2] || '';
    const charB = matchB[2] || '';

    if (numA !== numB) {
        return numA - numB;
    }

    if (charA < charB) return -1;
    if (charA > charB) return 1;

    return 0;
};

const BagContext = createContext();

export const useBags = () => {
    return useContext(BagContext);
};

export const BagProvider = ({ children }) => {
    const [bolsasDisponibles, setBolsasDisponibles] = useState([]);
    const [bolsasOcupadas, setBolsasOcupadas] = useState([]);
    const [loadingBags, setLoadingBags] = useState(true);

    const fetchBags = useCallback(async () => {
        try {
            setLoadingBags(true);
            const allBags = await getBagsByStatus(); 
            
            const disponibles = allBags
                .filter(bag => bag.status === 'DISPONIBLE')
                .map(bag => bag.id)
                .sort(sortBags); // Apply sorting
            
            const ocupadas = allBags
                .filter(bag => bag.status === 'OCUPADA')
                .map(bag => bag.id)
                .sort(sortBags); // Apply sorting
            
            setBolsasDisponibles(disponibles);
            setBolsasOcupadas(ocupadas);
        } catch (error) {
            console.error("Error fetching bags:", error);
        } finally {
            setLoadingBags(false);
        }
    }, []);

    useEffect(() => {
        fetchBags();
    }, [fetchBags]);

    const value = {
        bolsasDisponibles,
        bolsasOcupadas,
        loadingBags,
        refetchBags: fetchBags,
    };

    return (
        <BagContext.Provider value={value}>
            {children}
        </BagContext.Provider>
    );
};
