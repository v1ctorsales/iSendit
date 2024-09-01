import React, { createContext, useState } from 'react';

export const UuidContext = createContext();

export const UuidProvider = ({ children }) => {
    const [uuid, setUuid] = useState(null);

    return (
        <UuidContext.Provider value={{ uuid, setUuid }}>
            {children}
        </UuidContext.Provider>
    );
};
