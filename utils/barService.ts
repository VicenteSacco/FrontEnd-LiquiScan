import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '@/constants/Api';


interface Barra {
    id?: number;        // opcional cuando estás creando
    nombrebarra: string;
    idadministrador: number;
    idlista: number;
}

interface Lista {
    id: number;
    nombrelista: string;
    idadministrador: number;
}

export const fetchBarras = async (): Promise<Barra[]> => {
    const response = await fetch(`${API_URL}/barra/`);
    if (!response.ok) throw new Error('Error al obtener barras');
    return await response.json();
};

export const fetchBarra = async (id: number): Promise<Barra> => {
    const response = await fetch(`${API_URL}/barra/${id}/`);
    if (!response.ok) throw new Error('Error al obtener barra');
    return await response.json();
};

export const createBarra = async (barra: { nombrebarra: string; idadministrador: number; idlista: number }) => {
    const response = await fetch(`${API_URL}/barra/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(barra),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la barra');
    }

    return await response.json();  // Contiene: id, nombrebarra, idlista
};

// 👉 NUEVO: obtener listas por administrador
export const fetchListasPorAdministrador = async (idAdministrador: number): Promise<Lista[]> => {
    const response = await fetch(`${API_URL}/Lista_de_alcohol/${idAdministrador}/filtrar_lista/`);
    if (!response.ok) throw new Error('Error al obtener listas');
    return await response.json();
};

// 👉 NUEVO: lógica de crear barra con validación previa
export const createBarraValidando = async (idadministrador: number, nombrebarra: string): Promise<Barra> => {
    const listas = await fetchListasPorAdministrador(idadministrador);

    if (listas.length === 0) {
        throw new Error("Debes crear una lista antes de crear una barra.");
    }

    const listaPorDefecto = listas[0]; // Puedes elegir otra lógica si quieres
    return await createBarra({
        nombrebarra,
        idadministrador,
        idlista: listaPorDefecto.id,
    });
};

export const updateBarra = async (idBarra: number, updatedFields: Partial<Barra>) => {
    const response = await fetch(`${API_URL}/barra/${idBarra}/`, {
        method: 'PATCH',  // O 'PUT' si necesitas reemplazar todos los campos
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la barra');
    }

    return await response.json();  // Respuesta actualizada de la barra
};


export const fetchBarraPorLista = async (idLista: number): Promise<Barra> => {
    const response = await fetch(`${API_URL}/barra/${idLista}/por_lista/`);
    if (!response.ok) throw new Error('Error al obtener barra vinculada a la lista');
    return await response.json();
};

// NUEVO: fetch barras por administrador usando barra-por-idadmin endpoint
export const fetchBarrasPorAdmin = async (idAdmin: number): Promise<Barra[]> => {
    const response = await fetch(`${API_URL}/barra/${idAdmin}/filtrar_barra/`);
    if (!response.ok) throw new Error('Error al obtener barras por administrador');
    return await response.json();
};
