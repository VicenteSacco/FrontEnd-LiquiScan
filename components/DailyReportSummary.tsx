import { Colors } from '@/constants/Colors';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {handleDownloadExcel} from '@/utils/ReporteService';
import { Button } from '@/components/Button';

export type AlcoholUsage = {
  name: string;
  brand: string;
  description: string;
  bottlesUsed: number;
  ouncesUsed: number;
  image?: string;
};

type Props = {
  date: Date;
  data: AlcoholUsage[];
  reporteId: number;
};

export function DailyReportSummary({ date, data,reporteId }: Props) {
  const formattedDate = date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
        <Text style={styles.title}>{formattedDate.toUpperCase()}</Text>

        <View>
        {data.length === 0 ? (
            <Text style={styles.emptyText}>No hay registro para este día.</Text>
        ) : (
            data.map((item, index) => (
            <View key={index} style={styles.card}>
                <View style={styles.imageBox}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                    <Text style={styles.imageFallback}>{item.name}</Text>
                )}
                </View>

                <View style={styles.info}>
                <Text style={styles.alcoholName}>{item.name}</Text>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.description}>{item.description}</Text>
                </View>

                <View style={styles.stats}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{item.bottlesUsed}</Text>
                    <Text style={styles.statLabel}>Botellas</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{item.ouncesUsed}</Text>
                    <Text style={styles.statLabel}>Onzas</Text>
                </View>
                </View>
            </View>
            ))
        )}
        </View>

        {/* SIEMPRE visible */}
        <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.excelButton} onPress={() => {}}>
            <Button title="Descargar Excel" onPress={() => handleDownloadExcel(reporteId)} />
        </TouchableOpacity>
        </View>
    </View>
    );


}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.background,
    },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.dark.primary,
    paddingBottom: 6,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    backgroundColor: Colors.dark.background,
    padding: 20,
    textAlign: 'center',
    borderRadius: 8,
  },
  card: {
    backgroundColor: Colors.dark.softHighlight,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 6,
    resizeMode: 'contain',
  },
  imageFallback: {
    color: Colors.dark.text,
    textAlign: 'center',
    fontSize: 10,
  },
  info: {
    flex: 1,
  },
  alcoholName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  brand: {
    fontSize: 14,
    color: Colors.dark.primary,
  },
  description: {
    fontSize: 12,
    color: Colors.dark.text,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    backgroundColor: '#222',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.dark.text,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  excelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: 'transparent',
  },
  excelButtonText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
