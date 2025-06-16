import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Linking } from 'react-native';
import { Button } from '@/components/Button'; // Importamos el componente Button

// Definimos el tipo de objeto que esperamos del backend
export interface EstimationResult {
    fraccion: number;
    volumen_fl_oz: number;
    volumen_ml: number;
}

// Interfaz de props mejorada
interface ScanProps {
    drinkId: number;
    closeCamera: () => void;
    onEstimationComplete: (result: EstimationResult) => void;
}

// URL del backend (asegúrate de que sea la correcta para tu entorno)
const BACKEND_URL = 'http://10.0.2.2:8000/api/estimate_liquid/'; 

export const ScanDrink = ({ drinkId, closeCamera, onEstimationComplete }: ScanProps) => {
    // Hook para manejar los permisos de la cámara
    const [permission, requestPermission] = useCameraPermissions();
    const camRef = useRef<CameraView>(null);
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga

    // Si todavía estamos esperando la respuesta del permiso, mostramos un loader.
    if (!permission) {
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Si el permiso fue denegado, mostramos un mensaje y un botón para que el usuario
    // pueda ir a la configuración de la app y habilitarlos manualmente.
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Necesitamos tu permiso para usar la cámara.</Text>
                <Button title="Conceder Permiso" onPress={requestPermission} />
            </View>
        );
    }

    // Función unificada para tomar la foto, enviarla y manejar la respuesta.
    const takePictureAndEstimate = async () => {
        if (!camRef.current || isLoading) return; 
        
        setIsLoading(true); 

        try {
            // 1. Toma la foto
            const photo = await camRef.current.takePictureAsync({
                quality: 0.6,
                base64: true,
                skipProcessing: true,
            });

            if (!photo?.base64) {
                throw new Error('No se pudo capturar la imagen en base64.');
            }

            // 2. Envía la foto a la API de Django
            console.log('Enviando imagen al servidor...');
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: photo.base64,
                    drinkId: drinkId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error del servidor: ${response.status}`);
            }

            // 3. Llama a la función callback del componente padre con el resultado
            onEstimationComplete(data as EstimationResult);
            closeCamera(); 

        } catch (err: any) {
            console.error('Error al obtener la estimación:', err);
            Alert.alert('Error', err.message || 'Ocurrió un problema de comunicación.');
        } finally {
            setIsLoading(false); 
        }
    };

    // Si tenemos permiso, renderizamos la cámara.
    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={'back'} ref={camRef}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Analizando botella...</Text>
                    </View>
                )}

                {/* <Image source={require('@/assets/images/bottle-outline.png')} style={styles.outline} /> */}
            </CameraView>
            
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={closeCamera} disabled={isLoading}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.takeButton} onPress={takePictureAndEstimate} disabled={isLoading} />
                 <View style={{ width: 80 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black' },
    camera: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 20,
    },
    permissionText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    outline: { width: '50%', height: '70%', resizeMode: 'contain', opacity: 0.3 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
    controlsContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    takeButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', borderWidth: 4, borderColor: 'rgba(0,0,0,0.2)' },
    controlButton: { padding: 15 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
