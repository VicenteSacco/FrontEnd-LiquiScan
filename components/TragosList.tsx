import React, { useRef, useState } from 'react';
import { TragosListItem } from '@/components/TragosListItem';
import { Input } from '@/components/Input';
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
    const scrollRef = useRef<ScrollView>(null);
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
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
            <Input
                placeholder="Buscar..."
                variant="search"
                value={search}
                onChange={setSearch}
                style={styles.searchInput}
            />
            <ScrollView
                ref={scrollRef}
                horizontal
                style={styles.scrollContainer}
                onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
                onWheel={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newX = offset + e.deltaY;
                    scrollRef.current?.scrollTo({ x: newX, animated: false });
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.innerContainer}>
                    {list
                        .filter((item: Drink) =>
                            item.nombre.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((item: any) => (
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
    searchInput: {
        width: 250,
        alignSelf: 'center',
        marginBottom: 10,
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
    }
});
