import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../theme';
import { debounce } from 'lodash';

import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon, CalendarDaysIcon } from 'react-native-heroicons/solid';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';

import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utilis/asyncStorage';


const screenHeight = Dimensions.get('screen').height;
export default function HomeScreen() {
    const [showSearch, setShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);
    

    function handleLocation(loc){
        setLocations([]);
        setShowSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '3'
        }).then(data=>{
            setWeather(data);
            setLoading(false);
            storeData('city', loc?.name);
        })
    }

    const handleSearch = value => {
        //FETCH LOCATIONS
        if(value.length>2){
            fetchLocations({cityName: value}).then(data=>{
                setLocations(data);
            })
        }
    }
    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

    //LOAD USER DATA ON APP LAUNCH
    const fetchMyWeatherData = async () => {
        setLoading(true);
        const storedCity = await getData('city');
        let lastCity = 'Owerri';


        fetchWeatherForecast({
            cityName: storedCity ? storedCity : lastCity,
            days: '3'
        }).then(data=>{
            setWeather(data);
            setLoading(false);
        })
    }
    useEffect(()=>{
        fetchMyWeatherData();
    },[])

    const {current, location} = weather;

    return (
        <View className="flex-1 relative">
            <StatusBar style='light' />
            <Image blurRadius={70} source={require('../assets/bg.png')}
                className="absolute w-full h-full"
            />

            
                    <SafeAreaView className="flex flex-1"><KeyboardAvoidingView enabled behavior='height' style={{minHeight: screenHeight - 36}} className="flex flex-1">
                        {/*Search section*/}
                        <View style={{height: "7%"}} className="mx-4 relative z-50">
                            <View style={{backgroundColor: showSearch? THEME.bgWhite(0.2) :null}} className="flex-row justify-end items-center rounded-full">
                                {
                                    showSearch ?
                                    <TextInput
                                        onChangeText={handleTextDebounce}
                                        placeholder='Search for city'
                                        placeholderTextColor={'lightgray'}
                                        className="pl-6 pb-1 h-10 flex-1 text-base text-white"
                                    />
                                    : null
                                }
                                <TouchableOpacity onPress={()=>setShowSearch(!showSearch)} style={{backgroundColor: THEME.bgWhite(0.3)}} className="rounded-full p-3 m-1">
                                    <MagnifyingGlassIcon size={'25'} color={'white'} />
                                </TouchableOpacity>
                            </View>
                            {
                                locations.length>0 && showSearch? (
                                    <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                        {
                                            locations.map((loc, index)=>{
                                                let showBorder = index+1 != locations.length;
                                                let borderClass = showBorder? " border-b-2 border-b-gray-400" :"";
        
                                                return (
                                                <TouchableOpacity onPress={()=> handleLocation(loc)} key={index} className={"flex-row items-center border-0 p-3 px-4 mb-1"+borderClass}>
                                                    <MapPinIcon size="20" color={'gray'} />
                                                    <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                                                </TouchableOpacity> 
                                                )
                                            })
                                        }
                                    </View>
                                ): null
                            }
                        </View>
                        {
                        loading ? 
                        (
                            <View className="flex-1 flex-row justify-center items-center">
                                <Progress.CircleSnail thickness={10} size={140} color={'#FDDD10'} />
                            </View>
                        ) : (
                        <>
                            {/*Forecast section */}
                            <View className="mx-4 flex justify-around flex-1 mb-2">
                                {/*Location*/}
                                <Text className="text-white text-center text-2xl font-bold">
                                    {location?.name} 
                                    <Text className="text-lg font-semibold text-gray-300">{location ? `, ${location?.country}`: ""}</Text>
                                </Text>
                                {/* weather image */}
                                <View className="flex-row justify-center">
                                    <Image 
                                        source={weatherImages[current?.condition?.text?.toLowerCase().trim()]}
                                        className="w-52 h-52"
                                    />
                                </View> 
                                {/* degree */}
                                <View className="space-y-2">
                                    <Text className="text-white text-center font-bold text-6xl ml-5">{current? current?.temp_c: "0"}&#176;</Text>
                                    <Text className="text-white text-center text-xl tracking-wildest">{current? current?.condition?.text: ""}</Text>
                                </View>
                                {/* other stat */}
                                <View className="flex-row justify-between mx-4">
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/weather/icon/wind.png')} className="w-6 h-6"/>
                                        <Text className="text-white font-semibold text-base">{current? current?.wind_kph: "__"}km/h</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/weather/icon/drop.png')} className="w-6 h-6"/>
                                        <Text className="text-white font-semibold text-base">{current? current?.humidity: "__"}%</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/weather/icon/sun.png')} className="w-6 h-6"/>
                                        <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                                    </View>
                                </View>
                            </View>
            
                            {/* forecast for upcoming days */}
                            <View className="mb-2 space-y-3">
                                <View className="flex-row items-center mx-5 space-x-2">
                                    <CalendarDaysIcon size="22" color="white" />
                                    <Text className="text-white font-bold text-base">Daily forecast</Text>
                                </View>
                                <View className="flex-row gap-3 justify-between px-4 py-2">
                                    {
                                        weather?.forecast?.forecastday?.map((item, index)=>{
                                            let date = new Date(item?.date);
                                            let options = {weekday: "long"};
                                            let dayName = date.toLocaleDateString('en-US', options);
                                            dayName = dayName.split(',')[0];
                                            
                                            return (
                                                <View key={index} style={{backgroundColor: THEME.bgWhite(0.15)}} className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-1">
                                                    <Image source={weatherImages[item?.day?.condition?.text?.toLowerCase().trim()]} className="w-11 h-11" />
                                                    <Text className="text-white">{dayName}</Text>
                                                    <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                        </>
                        )
                        }
                    </KeyboardAvoidingView></SafeAreaView>
        </View>
    )
}