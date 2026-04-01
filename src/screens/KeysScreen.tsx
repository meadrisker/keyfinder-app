import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useKeysStore } from '../hooks/useKeysStore';
import KeySvg from '../components/KeySvg';
import { Key } from '../services/api';

export default function KeysScreen() {
  const navigation = useNavigation<any>();
  const { keys, isLoading, isRefreshing, currentPage, lastPage, fetchKeys, refreshKeys, deleteKey } = useKeysStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchKeys(); }, []);

  const filtered = search.trim()
    ? keys.filter((k) => k.name.toLowerCase().includes(search.toLowerCase()))
    : keys;

  const loadMore = () => {
    if (!isLoading && currentPage < lastPage) fetchKeys(currentPage + 1);
  };

  const confirmDelete = (key: Key) => {
    Alert.alert('Delete key', `Remove "${key.name}" from the keyring?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteKey(key.id) },
    ]);
  };

  const renderKey = ({ item }: { item: Key }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('KeyDetail', { key: item })}
      onLongPress={() => confirmDelete(item)}
    >
      <View style={styles.svgWrapper}>
        <KeySvg svg={item.svg} size={64} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
        {item.keywords ? (
          <Text style={styles.cardMeta}>
            {[item.keywords.colour, item.keywords.material, `${item.keywords.cut_count} cuts`]
              .filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search keys…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(k) => String(k.id)}
        renderItem={renderKey}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshKeys} tintColor="#0f6e56" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔑</Text>
            <Text style={styles.emptyTitle}>No keys yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first key</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddKey')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f0' },
  search:         { margin: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a1a', borderWidth: 1, borderColor: '#e0e0d8' },
  list:           { padding: 16, paddingTop: 8, gap: 10 },
  emptyContainer: { flex: 1 },

  card:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e8e8e0', gap: 12 },
  svgWrapper:     { width: 64, alignItems: 'center', justifyContent: 'center' },
  cardBody:       { flex: 1, gap: 2 },
  cardName:       { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  cardDesc:       { fontSize: 13, color: '#666' },
  cardMeta:       { fontSize: 12, color: '#999', marginTop: 2 },
  chevron:        { fontSize: 22, color: '#ccc', fontWeight: '300' },

  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyIcon:      { fontSize: 48 },
  emptyTitle:     { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtitle:  { fontSize: 14, color: '#999' },

  fab:            { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f6e56', alignItems: 'center', justifyContent: 'center', shadowColor: '#0f6e56', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabText:        { fontSize: 28, color: '#fff', lineHeight: 32 },
});
