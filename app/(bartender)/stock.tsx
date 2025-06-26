import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import { ScanDrink } from '@/components/ScanDrink';
import API_URL from '@/constants/Api';

export default function Stock() {
    const params = useLocalSearchParams();
    const listId = parseInt(Array.isArray(params.listId) ? params.listId[0] : params.listId);
    const barId = parseInt(Array.isArray(params.barId) ? params.barId[0] : params.barId);
    const barTitle = Array.isArray(params.barTitle) ? params.barTitle[0] : params.barTitle;
    

    const [stock, setStock] = useState<{ id: number | null, nombre: string, imagen: string, manualStock: number, aiStock: number }[]>([]);
    const [openCamera, setOpenCamera] = useState(false);
    const [scanDrinkId, setScanDrinkId] = useState<number | null>(null);
    const [hasPermission, setHasPermission] = useState(true);
    const [openModalWarning, setOpenModalWarning] = useState(false);
    const [openModalConfirm, setOpenModalConfirm] = useState(false);
    

    useEffect(() => {
        

        

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/Lista_a_alcohol/${listId}/filtrar_lista/`);
                const relaciones = await response.json();

                const tragos = await Promise.all(
                    relaciones.map(async (item: any) => {
                        const response = await fetch(`${API_URL}/alcohol/${item.idalcohol}/`);
                        const data = await response.json();

                        return {
                            id: data.id,
                            nombre: data.nombre,
                            imagen: data.imagen || null,
                            manualStock: -1,
                            aiStock: 0,
                        };
                    })
                );

                setStock(tragos);
            } catch (error) {
                console.error("Error cargando tragos:", error);
            }
        };

        fetchData();

        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleTakePicture = (id: number | null) => {
        setScanDrinkId(id);
        setOpenCamera(true);
    };

    const handleAccept = () => {
        const pendientes = stock.filter(item => item.manualStock < 0);
        if (pendientes.length === 0) {
            setOpenModalConfirm(true);
        } else {
            setOpenModalWarning(true);
        }
    };
  
    const handleBack = () => {
        router.back();
    };

    const handleSaveData = async () => {
  try {
    const payload = {
      fecha: new Date().toISOString().slice(0, 10),
      bartender: "NOMBRE_BARTENDER",
      idbarra: barId,
      barra: barTitle, // Solo incluye esto si ya lo agregaste al modelo correctamente
      inventarios: stock.map(item => ({
        alcohol: item.id,
        stock_normal: Math.max(0, item.manualStock),
        stock_ia: item.aiStock,
      })),
    };

    console.log("Payload a enviar:", JSON.stringify(payload, null, 2)); // 👈 Este es el log importante

    const responseReporte = await fetch(`${API_URL}/reportes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!responseReporte.ok) {
      const errorData = await responseReporte.json().catch(() => ({}));
      console.error("Error en el POST /reportes/:", responseReporte.status, errorData);
      throw new Error("Error al crear reporte");
    }

    console.log("Reporte creado correctamente");

    // PUTs para actualizar stock de alcohol
    await Promise.all(
      stock.map(async (item) => {
        const responseAlcohol = await fetch(`${API_URL}/alcohol/${item.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock_normal: Math.max(0, item.manualStock),
            stock_ia: item.aiStock
          })
        });

        if (!responseAlcohol.ok) {
          console.error(`Error actualizando alcohol ${item.id}`);
        }
      })
    );

    console.log("Stock actualizado correctamente");
    router.back();

  } catch (err) {
    console.error("Excepción en handleSaveData:", err);
  }
};


//en caso de errores usar este codigo!
    /*const handleSaveData = async () => {
    try {
        // Primero creamos el reporte
        const responseReporte = await fetch(`${API_URL}/reportes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            fecha: new Date().toISOString().slice(0, 10),
            bartender: "NOMBRE_BARTENDER",
            idbarra: barId,
            barra: "NOMBRE_BARRA",
            inventarios: stock.map(item => ({
                alcohol: item.id,
                stock_normal: Math.max(0, item.manualStock),
                stock_ia: item.aiStock,
            })),
        }),
    }); 

    if (!responseReporte.ok) throw new Error("Error al crear reporte");

    console.log("Reporte creado correctamente");

        if (!responseReporte.ok) throw new Error("Error al crear reporte");
        console.log("Reporte creado correctamente");

        await Promise.all(
            stock.map(async (item) => {
                const responseAlcohol = await fetch(`${API_URL}/alcohol/${item.id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stock_normal: Math.max(0, item.manualStock),
                        stock_ia: item.aiStock
                    })
                });

                if (!responseAlcohol.ok) {
                    console.error(`Error actualizando alcohol ${item.id}`);
                }
            })
        );

        console.log("Stock actualizado correctamente");
        router.back();

    } catch (err) {
        console.error(err);
    }
};*/

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>{barTitle}</Text>

                <ScrollView style={styles.barsContainer} pointerEvents={openModalConfirm || openModalWarning ? 'none' : 'auto'}>
                    {stock.map((tragos, index) => (
                        <View style={styles.itemContainer} key={tragos.id}>
                            <Image source={{ uri: tragos.imagen }} style={styles.image} />
                            <View style={styles.rightContainer}>
                                <Text style={styles.text}>{tragos.nombre}</Text>
                                <View style={styles.middleContainer}>
                                    <View style={styles.manualInputContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const updatedStock = [...stock];
                                                updatedStock[index].manualStock = (updatedStock[index].manualStock || 0) - 1;
                                                setStock(updatedStock);
                                            }}
                                            disabled={tragos.manualStock < 0}
                                        >
                                            <Text style={styles.inputButton}>-</Text>
                                        </TouchableOpacity>

                                        <TextInput
                                            style={styles.textManual}
                                            placeholder='0'
                                            keyboardType='numeric'
                                            onChangeText={(text) => {
                                                const updatedDrinks = [...stock];
                                                updatedDrinks[index].manualStock = parseInt(text) || 0;
                                                setStock(updatedDrinks);
                                            }}
                                            value={tragos.manualStock < 0 ? '-' : tragos.manualStock.toString()}
                                        />

                                        <TouchableOpacity
                                            onPress={() => {
                                                const updatedStock = [...stock];
                                                updatedStock[index].manualStock = (updatedStock[index].manualStock || 0) + 1;
                                                setStock(updatedStock);
                                            }}
                                        >
                                            <Text style={styles.inputButton}>+</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.scanContainer}>
                                        <TouchableOpacity onPress={() => handleTakePicture(tragos.id)}>
                                            <Image
                                                source={require('@/assets/images/icon-scan.png')}
                                                style={styles.icon}
                                            />
                                        </TouchableOpacity>
                                        <Text style={styles.textAi}>{tragos.aiStock < 0 ? '-' : tragos.aiStock.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.textTotal}>TOTAL: {tragos.manualStock < 0 ? '' : (tragos.manualStock + tragos.aiStock).toFixed(2)}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.buttonContainer} pointerEvents={openModalConfirm || openModalWarning ? 'none' : 'auto'}>
                    <Button title='Volver' variant='secondary' onPress={handleBack} />
                    <Button title='Aceptar' onPress={handleAccept} />
                </View>
            </View>

            {openCamera && stock.length > 0 &&
                <ScanDrink
                    drinkId={scanDrinkId}
                    closeCamera={() => setOpenCamera(false)}
                    stock={stock}
                    setStock={setStock}
                    onEstimationComplete={() => console.log("Estimación completa")}
                />
            }

            {openModalWarning &&
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Faltan elementos por contar</Text>
                    <Button title='Aceptar' onPress={() => setOpenModalWarning(false)} />
                </View>
            }

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
        flex: 1, 
        backgroundColor: Colors.dark.background,
        paddingBottom: 20, 
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
        flex: 1,
        paddingHorizontal: 20, 
        paddingVertical: 20,
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
        backgroundColor: '#ffffff',
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
