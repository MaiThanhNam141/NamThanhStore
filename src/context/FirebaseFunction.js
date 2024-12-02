import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore'

export const getCurrentUser = () => {
    return auth().currentUser;
}
export const getUserInfo = async () => {
    try {
        const user = getCurrentUser();
        const userRef = firestore().collection('users').doc(user.uid);
        if (userRef) {
            const snapshot = await userRef.get();
            return snapshot.data();
        }
    } catch (error) {
        console.error("Firebase getUserInfo: ", error);
    }
}

export const getDocumentRef = async (collectionName) => {
    try {
        return await firestore().collection(collectionName).get()
    } catch (error) {
        console.error("handleFirestore:", error)
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

export const fetchItemsCheckout = async (selectedItems) => {
    try {
        const items = await Promise.all(
            selectedItems.map(async (selectedItem) => {
                const doc = await firestore().collection('productFood').doc(selectedItem.id.toString()).get();
                return { id: doc.id, ...doc.data() };
            })
        );

        return items
    } catch (error) {
        console.error("Fetch items checkout error: ", error);
    }
};

export const updateOrderWithID = async (id, data, status) => {
    try {
        await firestore().collection('orders').doc(id).update({
            embed_data: {
                ...data,
                status: status
            }
        });
        return true;
    } catch (error) {
        console.error("Error update order: ", error);
        return false;
    }
};

export const getUserRef = () => {
    try {
        const user = getCurrentUser();
        return firestore().collection('users').doc(user.uid);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const updateRateProduct = (rate, rateCount, id) => {
    try {
        firestore().collection('productFood').doc(id).update({
            rate: rate, 
            rateCount: rateCount,
        });
    } catch (error) {
        console.error("Error update order: ", error);
    }
}

export const feedbackOrder = async ( id, rate, comment ) => {
    try {
        await firestore().collection('orders').doc(id).update({
            rate,
            comment,
        });
        return true;
    } catch (error) {
        console.error("Error update order: ", error);
        return false;
    }
}
