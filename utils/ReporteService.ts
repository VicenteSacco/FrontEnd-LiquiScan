import * as WebBrowser from 'expo-web-browser';

import API_URL from "@/constants/Api";

export interface InventarioFinal {
  id: number;
  reporte: number;
  alcohol: number;
  stock_normal: number;
  stock_ia: number;
  liquidez_lista: number;
  stock_total: number;
}

export interface Reporte {
  id: number;
  fecha: string;
  bartender: string;
  idbarra: number;
  inventarios?: InventarioFinal[];
}

export const getReportesPorAdministrador = async (adminId: number): Promise<Reporte[]> => {
  const response = await fetch(`${API_URL}/reportes/${adminId}/por_administrador/`);
  if (!response.ok) throw new Error("Error al obtener reportes del administrador");
  return await response.json();
};

export const getReportesFiltrados = async (idbarra?: number, fecha?: string): Promise<Reporte[]> => {
  const params = new URLSearchParams();
  if (idbarra) params.append("idbarra", idbarra.toString());
  if (fecha) params.append("fecha", fecha);

  const response = await fetch(`${API_URL}/reportes/?${params.toString()}`);
  if (!response.ok) throw new Error("Error al obtener reportes filtrados");
  return await response.json();
};

export const getInventariosPorReporte = async (reporteId: number): Promise<InventarioFinal[]> => {
  const response = await fetch(`${API_URL}/inventarios/${reporteId}/por_reporte/`);
  if (!response.ok) throw new Error("Error al obtener inventarios del reporte");
  return await response.json();
};

export const crearReporte = async (nuevoReporte: {
  fecha: string;
  bartender: string;
  idbarra: number;
  inventarios: {
    alcohol: number;
    stock_normal: number;
    stock_ia: number;
  }[];
}): Promise<Reporte> => {
  const response = await fetch(`${API_URL}/reportes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoReporte),
  });
  if (!response.ok) throw new Error("Error al crear el reporte");
  return await response.json();
};

export async function handleDownloadExcel(reporteId: number) {
  const url = `${API_URL}/descargar_reporte/${reporteId}/`;
  await WebBrowser.openBrowserAsync(url);
}

export const getReportesPorBarra = async (barId: number): Promise<Reporte[]> => {
  const response = await fetch(`${API_URL}/reportes/${barId}/por_barra/`);
  if (!response.ok) throw new Error("Error al obtener reportes por barra");
  return await response.json();
};