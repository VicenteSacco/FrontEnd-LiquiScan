import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { clearSession } from '@/utils/session';
import { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import { ScanDrink } from '@/components/ScanDrink';

export default function stock() {
    const listas = [
        {
            id: 1,
            title: 'Lista Clásica',
            items: [
                { id: 1, title: 'Pisco Sour', image: 'https://example.com/pisco-sour.png' },
                { id: 2, title: 'Mojito', image: 'https://example.com/mojito.png' },
                { id: 11, title: 'Smoked Negroni', image: 'https://example.com/smoked-negroni.png' },
            ],
        },
        {
            id: 12,
            title: 'Lista Premium',
            items: [
                { id: 3, title: 'Old Fashioned', image: 'https://example.com/old-fashioned.png' },
                { id: 11, title: 'Smoked Negroni', image: 'https://example.com/smoked-negroni.png' },
                { id: 1, title: 'Pisco Sour', image: 'https://example.com/pisco-sour.png' },
                { id: 4, title: 'Martini', image: 'https://example.com/martini.png' },
                { id: 9, title: 'Limonada Menta Jengibre', image: 'https://example.com/limonada.png' },
                { id: 10, title: 'Mocktail Tropical', image: 'https://example.com/mocktail.png' },
                { id: 7, title: 'Tequila Sunrise', image: 'https://example.com/tequila-sunrise.png' },
                { id: 2, title: 'Mojito', image: 'https://example.com/mojito.png' },
                { id: 5, title: 'Caipirinha', image: 'https://example.com/caipirinha.png' },
                { id: 6, title: 'Daiquiri', image: 'https://example.com/daiquiri.png' },
                { id: 8, title: 'Sex on the Beach', image: 'https://example.com/sex-on-the-beach.png' },
                { id: 13, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
                { id: 14, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
                { id: 15, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
                { id: 16, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
                { id: 17, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
                { id: 18, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
            ],
        },
        {
            id: 3,
            title: 'Lista Refrescante',
            items: [
                { id: 5, title: 'Caipirinha', image: 'https://example.com/caipirinha.png' },
                { id: 6, title: 'Daiquiri', image: 'https://example.com/daiquiri.png' },
                { id: 2, title: 'Mojito', image: 'https://example.com/mojito.png' },
            ],
        },
        {
            id: 4,
            title: 'Lista Fiestera',
            items: [
                { id: 7, title: 'Tequila Sunrise', image: 'https://example.com/tequila-sunrise.png' },
                { id: 8, title: 'Sex on the Beach', image: 'https://example.com/sex-on-the-beach.png' },
                { id: 1, title: 'Pisco Sour', image: 'https://example.com/pisco-sour.png' },
            ],
        },
        {
            id: 5,
            title: 'Lista sin Alcohol',
            items: [
                { id: 9, title: 'Limonada Menta Jengibre', image: 'https://example.com/limonada.png' },
                { id: 10, title: 'Mocktail Tropical', image: 'https://example.com/mocktail.png' },
                { id: 7, title: 'Tequila Sunrise', image: 'https://example.com/tequila-sunrise.png' },
                { id: 2, title: 'Mojito', image: 'https://example.com/mojito.png' },
            ],
        },
        {
            id: 6,
            title: 'Lista Experimental',
            items: [
                { id: 11, title: 'Smoked Negroni', image: 'https://example.com/smoked-negroni.png' },
                { id: 7, title: 'Tequila Sunrise', image: 'https://example.com/tequila-sunrise.png' },
                { id: 12, title: 'Lavender Mule', image: 'https://example.com/lavender-mule.png' },
            ],
        },
    ];
    // Objeto que almacena el stock ingresado
    const [stock, setStock] = useState<{ id: number, title: string, image: string, manualStock: number, aiStock: number }[]>();

    const [openCamera, setOpenCamera] = useState(false);
    const [scanDrinkId, setScanDrinkId] = useState<number | null>(null);
    const [hasPermission, setHasPermission] = useState(true);
    const [openModalWarning, setOpenModalWarning] = useState(false);
    const [openModalConfirm, setOpenModalConfirm] = useState(false);
    const params = useLocalSearchParams();
    useEffect(() => {
        const getList = (id: number) => {
            return listas.find((l: { id: number, title: string, items: { id: number, title: string, image: string }[] }) => l.id == id);
        }
        let listId = parseInt(Array.isArray(params.listId) ? params.listId[0] : params.listId);
        let newDrinks = getList(listId)?.items.map((item) => ({ ...item, manualStock: -1, aiStock: 0 }));
        setStock(newDrinks);
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);
    const handleTakePicture = (id: number) => {
        setScanDrinkId(id);
        setOpenCamera(true);
    }
    const handleAccept = async () => {
        const lista = stock?.filter((item) => item.manualStock < 0);
        if (lista?.length == 0) {
            setOpenModalConfirm(true);
        }
        else {
            setOpenModalWarning(true);
        }
    }
    const handleBack = () => {
        router.back();
    };
    const handleSaveData = () => {
        console.log('Saving...');
        console.log(stock);
        router.back();
    }
    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>
                    {params.barTitle}
                </Text>

                <Text style={styles.textIntrucction}></Text>
                <ScrollView style={styles.barsContainer} pointerEvents={openModalConfirm || openModalWarning ? 'none' : 'auto'}>
                    {
                        stock && stock.map((drink, index) => (
                            <View style={styles.itemContainer} key={drink.id}>
                                <Image
                                    source={require('@/assets/images/trago.jpg')}
                                    style={styles.image}
                                />
                                <View style={styles.rightContainer}>
                                    <Text style={styles.text}>{drink.title}</Text>
                                    <View style={styles.middleContainer}>
                                        <View style={styles.manualInputContainer}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const updatedStock = [...stock];
                                                    updatedStock[index] = {
                                                        ...updatedStock[index],
                                                        manualStock: (updatedStock[index].manualStock || 0) - 1
                                                    }
                                                    setStock(updatedStock);
                                                }}
                                                disabled={drink.manualStock < 0}
                                            >
                                                <Text style={styles.inputButton}>-</Text>
                                            </TouchableOpacity>
                                            <TextInput style={styles.textManual}
                                                placeholder='0'
                                                keyboardType='numeric'
                                                onChangeText={(text) => {
                                                    const updatedDrinks = [...stock];
                                                    updatedDrinks[index] = {
                                                        ...updatedDrinks[index],
                                                        manualStock: parseInt(text) || 0
                                                    };
                                                    setStock(updatedDrinks);
                                                }}
                                                value={drink.manualStock < 0 ? '-' : drink.manualStock.toString()}
                                            />
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const updatedStock = [...stock];
                                                    updatedStock[index] = {
                                                        ...updatedStock[index],
                                                        manualStock: (updatedStock[index].manualStock || 0) + 1
                                                    }
                                                    setStock(updatedStock);
                                                }}>
                                                <Text style={styles.inputButton}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.scanContainer}>
                                            <TouchableOpacity onPress={() => { handleTakePicture(drink.id) }}>
                                                <Image
                                                    source={require('@/assets/images/icon-scan.png')}
                                                    style={styles.icon}
                                                />
                                            </TouchableOpacity>
                                            <Text style={styles.textAi}>{drink.aiStock < 0 ? '-' : drink.aiStock.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.textTotal}>TOTAL: {drink.manualStock < 0 ? '' : (drink.manualStock + drink.aiStock).toFixed(2)}</Text>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView >
                <View style={styles.buttonContainer} pointerEvents={openModalConfirm || openModalWarning ? 'none' : 'auto'}>
                    <Button title='Volver' variant='secondary' onPress={handleBack} />
                    <Button title='Aceptar' onPress={handleAccept} />
                </View>
            </View >
            {/* Camara */}
            {openCamera && stock != undefined &&
                <ScanDrink drinkId={scanDrinkId} closeCamera={() => setOpenCamera(false)} stock={stock} setStock={setStock} />
            }
            {/* Modal Warning */}
            {openModalWarning &&
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Faltan elementos por contar</Text>
                    <Button title='Aceptar' onPress={() => setOpenModalWarning(false)} />
                </View>
            }
            {/* Modal Confirm */}
            {openModalConfirm &&
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>¿Desea enviar inventario?</Text>
                    <View style={styles.modalButtonContainer}>
                        <Button title='Si' variant='secondary' onPress={handleSaveData} />
                        <Button title='No' onPress={() => setOpenModalConfirm(false)} />
                    </View>
                </View>
            }
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: '100%',
        paddingBlock: 40,
        position: 'relative',
        backgroundColor: Colors.dark.background,
    },
    title: {
        color: Colors.dark.text,
        height: 80,
        lineHeight: 80,
        paddingInline: 60,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        fontSize: 24,
        fontWeight: 700,
        borderColor: Colors.dark.text,

    },
    textIntrucction: {
        color: Colors.dark.text,
        textAlign: 'center',
        marginBlock: 20,
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    barsContainer: {
        marginInline: 20,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingBlockEnd: 40,
    },
    itemContainer: {
        borderColor: Colors.dark.text,
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        justifyContent: 'center',
        marginBlock: 6,
    },
    middleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        gap: 5,
        justifyContent: 'center',
        padding: 5,
    },
    scanContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    image: {
        width: 90,
        height: 110,
        objectFit: 'cover',
    },
    text: {
        color: Colors.dark.text,
        textTransform: 'uppercase',
        fontSize: 13,
        fontWeight: 700,
        flex: 1,
    },
    manualInputContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputButton: {
        color: Colors.dark.text,
        width: 20,
        height: 20,
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 20,
        textAlign: 'center',
    },
    textManual: {
        color: Colors.dark.text,
        borderBottomWidth: 1,
        borderColor: Colors.dark.text,
        textAlign: 'center',
        width: 40,
    },
    textAi: {
        color: Colors.dark.text,
        textAlign: 'center',
    },
    textTotal: {
        height: 30,
        lineHeight: 30,
        color: Colors.dark.primary,
        fontWeight: 700,
    },
    icon: {
        width: 40,
        height: 40,
        objectFit: 'cover',
    },
    buttonContainer: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        borderTopWidth: 1,
        borderColor: Colors.dark.text,
    },
    modalContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 350,
        height: 160,
        backgroundColor: Colors.dark.background,
        borderWidth: 1,
        borderColor: Colors.dark.text,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        transform: 'translateX(-175px) translateY(-80px)',
    },
    modalButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
    },
    modalText: {
        color: Colors.dark.text,
        fontSize: 20,
        textAlign: 'center',
        height: 58,
        borderColor: Colors.dark.text,
        borderBottomWidth: 1,
        textTransform: 'uppercase',
    }
});
