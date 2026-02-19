import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import { COLORS } from '../../styles/color';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useNavigation } from '@react-navigation/native';
import { useSpecialitySuggestions } from '../../api/SpecialitySearchFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen = () => {
  const navigation = useNavigation();

  const RECENT_KEY = 'recentSpecialitySearches';
  const [recents, setRecents] = useState([]);

  // read your JWT from AsyncStorage 
  const [token, setToken] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const candidateKeys = ['accessToken', 'token', 'jwt', 'auth', 'AUTH_TOKEN'];
        console.log("Token", candidateKeys)
        
        let raw = null;
        for (const key of candidateKeys) {
          const v = await AsyncStorage.getItem(key);
          if (v) {
            raw = v;
            console.log(`Found token in storage key: ${key}`);
            break;
          }
        }

        if (raw) {
          let jwt = raw;
          try {
            const obj = JSON.parse(raw);
            jwt = obj?.accessToken || obj?.token || obj?.jwt || obj?.Authorization || raw;
          } catch (_) {
            // raw string token; keep as-is
          }
          // Normalize to an Authorization header value
          if (jwt && !jwt.startsWith('Bearer ')) jwt = `Bearer ${jwt}`;

          setToken(jwt);
          console.log('Authorization header set from storage');
        } else {
          console.log('No token found in storage under known keys');
        }
      } catch (e) {
        console.error('Error reading token:', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setRecents(arr);
        }
      } catch (e) {
        console.warn('Failed to load recents', e);
      }
    })();
  }, []);

  const { q, setQ, items, loading } = useSpecialitySuggestions(token);

  const persistRecents = async (next) => {
    try {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to persist recents', e);
    }
  };

  const addRecent = async (term) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, 10);
    setRecents(next);
    await persistRecents(next);
  };

  const clearRecents = async () => {
    try {
      setRecents([]);
      await AsyncStorage.removeItem(RECENT_KEY);
    } catch (e) {
      console.warn('Failed to clear recents', e);
    }
  };

  const onChange = useCallback((text) => {
    setQ(text);
  }, [setQ]);

  const clear = useCallback(() => {
    clearRecents();
  }, []);

  const pick = useCallback(async (item) => {
    setQ(item.title);
    await addRecent(item.title);
    console.log('[SearchScreen1] navigate DoctorList with', { specialityId: item.id, specialityTitle: item.title });
    navigation.navigate('doctorsList', { specialityId: item.id, specialityTitle: item.title });
  }, [addRecent, navigation, setQ]);

  const pickRecent = useCallback(async (term) => {
    setQ(term);
    await addRecent(term);
    console.log('[SearchScreen2] navigate DoctorList with', { specialityTitle: term });
    navigation.push('doctorsList', { specialityTitle: term });
  }, [addRecent, navigation, setQ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => pick(item)} style={styles.itemRow}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity onPress={() => pickRecent(item)} style={styles.itemRow}>
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {!token && (
          <Text style={styles.tokenWarning}>You need to sign in to search specialities.</Text>
        )}
        <SearchBar value={q} onChange={onChange} />
      </View>

      <View style={styles.subContainer}>
        <Text>Recent Searches</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clear}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
      </View>

      {q.trim().length < 3 && recents.length > 0 && (
        <FlatList
          data={recents}
          keyExtractor={(it, idx) => `${it}-${idx}`}
          renderItem={renderRecentItem}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {loading && <ActivityIndicator style={{ marginTop: 8 }} />}

      {q.trim().length >= 3 && (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={!loading ? (
            <View style={styles.empty}><Text style={styles.emptyText}>No specialities found</Text></View>
          ) : null}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  searchContainer: { backgroundColor: COLORS.PRIMARY, height: 150, alignItems: 'center' },
  subContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  clearButton: {},
  clearText: { color: COLORS.PRIMARY, fontWeight: 'bold' },
  itemRow: { paddingHorizontal: 16, paddingVertical: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#666' },
  tokenWarning: { marginTop: 12, paddingHorizontal: 16, textAlign: 'center', color: '#fff', opacity: 0.9 },
});