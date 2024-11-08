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
        ToastAndroid.show("Không thể lấy thông tin sản phẩm", ToastAndroid.SHORT);
    }
};
