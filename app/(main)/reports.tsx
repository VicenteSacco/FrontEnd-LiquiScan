import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { DailyReportSummary, AlcoholUsage } from '@/components/DailyReportSummary';
import { ReportCalendar } from '@/components/ReporteCalendar';
import { Colors } from '@/constants/Colors';

import {getAdminId} from '@/utils/auth'
import { fetchBarrasPorAdmin, createBarraValidando } from '@/utils/barService';
import { fetchAlcoholes } from '@/utils/listsService';
import { getReportesPorAdministrador, getInventariosPorReporte, getReportesPorBarra } from '@/utils/ReporteService';

import { Pin } from '@/components/Pin';
import { Barra } from '@/types/Barras';

interface Reporte {
  id: number;
  fecha: string;
  bartender: string;
  idbarra: number;
}

interface Alcohol {
  id: number;
  nombre: string;
  marca: string;
  descripcion?: string;
  imagen?: string;
}

export default function Reports() {
  const [selectedBar, setSelectedBar] = useState<number | undefined>(undefined);
  const [bars, setBars] = useState<Barra[]>([]);
  const [daysWithData, setDaysWithData] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reportData, setReportData] = useState<AlcoholUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [barReportes, setBarReportes]=useState<Reporte[]>([]);

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const idAdministrador = await getAdminId();
        if (idAdministrador === null) {
          console.warn('No se encontró idadministrador en AsyncStorage');
          return;
        }
        const barras = await fetchBarrasPorAdmin(idAdministrador);
        setBars(barras);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBars();
  }, []);

  const loadReportsForBar = async () => {
    setSelectedDate(null);
    setLoading(true);
    try {
      if (!selectedBar) return;
      const reportes = await getReportesPorBarra(selectedBar);
      const fechas = reportes.map((r) => r.fecha.slice(0, 10));
      setDaysWithData(fechas);
      setBarReportes(reportes); 
    } catch (err) {
      console.error(err);
      setDaysWithData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetails = async (date: Date) => {
    if (!selectedBar) return;
    setLoading(true);
    try {
      const idAdministrador = await getAdminId();
      const reportes = await getReportesPorAdministrador(idAdministrador);
      const dateStr = getFormattedDateKey(date);
      console.log("Reportes disponibles:", reportes.map(r => r.fecha));
      console.log("Buscando fecha:", dateStr);
      const reporte = barReportes.find((r) => r.fecha.slice(0, 10) === dateStr);
      if (!reporte){
        console.warn("No se encontró reporte para la fecha:", dateStr);
        return;
      } 
        setSelectedReportId(reporte.id);
        
      const inventario = await getInventariosPorReporte(reporte.id);
      const alcoholes: Alcohol[] = await fetchAlcoholes();
      const fullReport: AlcoholUsage[] = inventario.map((item) => {
        const alcoholInfo = alcoholes.find((a) => a.id === item.alcohol);
        return {
          name: alcoholInfo?.nombre || 'Desconocido',
          brand: alcoholInfo?.marca || '',
          description: alcoholInfo?.descripcion || '',
          bottlesUsed: item.stock_normal,
          ouncesUsed: item.stock_ia,
          image: alcoholInfo?.imagen || '',
        };
      });
      setReportData(fullReport);
    } catch (err) {
      console.error(err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return (
    <ScrollView style={{ backgroundColor: Colors.dark.background }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>REPORTES</Text>

      {/* Selector de barra */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedBar}
          onValueChange={(value: number) => {
            setSelectedBar(value);
            if (value !== null) loadReportsForBar();
          }}
          style={{ color: Colors.dark.text }}
        >
          <Picker.Item label="Seleccionar Barra" value={undefined} />
          {bars.map((bar) => (
            <Picker.Item key={bar.id} label={bar.nombrebarra} value={bar.id} />
          ))}
        </Picker>
      </View>
      {loading && <ActivityIndicator size="large" color={Colors.dark.text} />}

      {/* Calendario */}
      {selectedBar && !loading && (
        <View style={styles.calendarContainer}>
          <ReportCalendar
            daysWithData={daysWithData}
            onSelectDate={(date) => {
              setSelectedDate(date);
              loadReportDetails(date);
            }}
          />
        </View>
      )}

      {/* Reporte del día */}
      {selectedDate && reportData.length > 0 && (
        <DailyReportSummary date={selectedDate} data={reportData} reporteId={selectedReportId!} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    paddingBottom: 40,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 60,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: Colors.dark.text,
    textTransform: 'uppercase',
  },
  pickerContainer: {
    marginHorizontal: 24,
    marginVertical: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  calendarContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
