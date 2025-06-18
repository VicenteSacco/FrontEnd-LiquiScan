import { TragosListItem } from '@/components/TragosListItem';
import { Colors } from '@/constants/Colors';
import { Drink } from '@/types/drinks';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

interface ListProps {
    title: string;
    selectedList: number[];
    setSelected: any,
    list: any,
}

export const TragosList = ({ title, selectedList, setSelected, list }: ListProps) => {
    const addItemToSelected = (item: Drink) => {
        const exists = selectedList.includes(item.id);
        if (!exists) {
            const newSelected = [...selectedList, item.id];
            setSelected(newSelected);
        } else {
            const newSelected = selectedList.filter(id => id !== item.id);
            setSelected(newSelected);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal style={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    {list.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => addItemToSelected(item)}
                        >
                            <TragosListItem
                                title={item.nombre}
                                selected={selectedList.some(drink => drink === item.id)}
                                path={item.imagen}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '95%',
        height: 300,
        marginInline: 'auto',
    },
    title: {
        height: 55,
        fontSize: 20,
        color: Colors.dark.text,
        textTransform: 'uppercase',
        paddingLeft: 18,
        lineHeight: 55,
        borderColor: Colors.dark.text,
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    scrollContainer: {
        paddingInline: 40,
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
    }
});
