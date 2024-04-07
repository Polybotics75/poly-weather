import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try{
        await AsyncStorage.setItem(key, value);
    }catch(err){
        console.log('Error storing data: ', err);
    }
}

const getData = async (key) => {
    try{
        const result = await AsyncStorage.getItem(key);
        return result;
    }catch(err){
        console.log('Error retrieving data: ', err);
    }
}

export{
    storeData,
    getData
}