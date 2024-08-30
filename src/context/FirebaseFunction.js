import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore'

export const getCurrentUser = () => {
    return auth().currentUser;
}
export const getUserInfo = async () => {
    try {
        const user = getCurrentUser();
        const userRef = firestore().collection('users').doc(user.uid);
        if (userRef){
            const snapshot = await userRef.get();
            return snapshot.data();
        }
    } catch (error) {
        console.error("Firebase getUserInfo: ", error);
    }
}

export const setuserInfo = (userDocData) => {
    try {
        const user = getCurrentUser();
        const userRef = firestore().collection('users').doc(user.uid);
        userRef.set(userDocData);
    } catch (error) {
        console.error("Firebase setUserInfo: ", error);   
    }
}

export const updateUserInfo = (userDocData) => {
    try {
        const user = getCurrentUser();
        const userRef = firestore().collection('users').doc(user.uid);
        userRef.update(userDocData);
    } catch (error) {
        console.error("Firebase setUserInfo: ", error);   
    }
}
