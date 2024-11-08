import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userExist, setUserExist] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const unsubscribe = auth().onAuthStateChanged(user => {
                if(user){
                    setUserExist(user);
                }
                else {
                    setUserExist(false);
                }
            });
            return () => unsubscribe();
        } catch (error) {
            console.log("UserContext: ", error);
        }
        finally {
            setLoading(false);
        }
    }, []);

    return (
        <UserContext.Provider value={{ userExist, setUserExist, loading }}>
            {children}
        </UserContext.Provider>
    );
};
