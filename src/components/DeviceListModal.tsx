import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Bluetooth, BluetoothSearching, BluetoothConnected, Sparkles, X } from 'lucide-react-native';
import { useBluetooth } from '../context/BluetoothContext';
import { ScannedDevice } from '../types/control.types';
import { Colors, FontFamily, Shadow } from '../constants/theme';

interface Props {
  onClose: () => void;
}

// Padrões de nome de dispositivos conhecidos pelo app (case-insensitive)
const KNOWN_NAME_PATTERNS = [
  'micro:bit', 'microbit', 'hc-05', 'hc-06', 'hc-08', 'hm-10', 'controlbit',
];

function isRecognized(name: string): boolean {
  const n = name.toLowerCase();
  return KNOWN_NAME_PATTERNS.some((p) => n.includes(p));
}

type FilterMode = 'todos' | 'novos' | 'pareados';

function RssiBar({ rssi }: { rssi: number }) {
  const strength = Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
  const bars = strength > 70 ? 4 : strength > 45 ? 3 : strength > 20 ? 2 : 1;

  return (
    <View style={styles.rssiContainer}>
      {[1, 2, 3, 4].map((b) => (
        <View
          key={b}
          style={[
            styles.rssiBar,
            { height: b * 5, backgroundColor: b <= bars ? Colors.dark : 'transparent' },
          ]}
        />
      ))}
    </View>
  );
}

export default function DeviceListModal({ onClose }: Props) {
  const { status, scannedDevices, startScan, stopScan, connectToDevice } =
    useBluetooth();
  const isScanning = status === 'scanning';
  const isConnecting = status === 'connecting';

  // Busca + filtro
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('todos');

  const visibleDevices = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = scannedDevices.filter((d) => {
      if (query && !d.name.toLowerCase().includes(query)) return false;
      if (filterMode === 'novos' && d.bonded) return false;
      if (filterMode === 'pareados' && !d.bonded) return false;
      return true;
    });

    // Reconhecidos-não-pareados primeiro; demais mantêm ordem de descoberta
    return [...filtered].sort((a, b) => {
      const aTop = isRecognized(a.name) && !a.bonded ? 1 : 0;
      const bTop = isRecognized(b.name) && !b.bonded ? 1 : 0;
      return bTop - aTop;
    });
  }, [scannedDevices, search, filterMode]);

  // Animação de slide up
  const slideAnim = React.useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    startScan();
    return () => stopScan();
  }, []);

  // Dots de scanning animados
  const dot1 = React.useRef(new Animated.Value(0.3)).current;
  const dot2 = React.useRef(new Animated.Value(0.3)).current;
  const dot3 = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isScanning) return;
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 200);
    pulse(dot3, 400);
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [isScanning]);

  const handleConnect = async (dev: ScannedDevice) => {
    await connectToDevice(dev);
    onClose();
  };

  const renderDevice = ({ item }: { item: ScannedDevice; index: number }) => {
    const highlighted = isRecognized(item.name) && !item.bonded;
    return (
      <TouchableOpacity
        style={[styles.deviceRow, highlighted && styles.deviceRowHighlighted]}
        activeOpacity={0.85}
        onPress={() => handleConnect(item)}
      >
        <View style={[styles.deviceIconBox, { backgroundColor: item.type === 'classic' ? '#1A6B32' : '#0066FF' }]}>
          <BluetoothConnected size={18} color="#fff" strokeWidth={2.5} />
        </View>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceNameRow}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {item.name}
            </Text>
            {highlighted && (
              <View style={styles.recognizedBadge}>
                <Sparkles size={9} color={Colors.dark} strokeWidth={2.5} />
                <Text style={styles.recognizedBadgeText}>RECONHECIDO</Text>
              </View>
            )}
          </View>
          <Text style={styles.deviceId} numberOfLines={1}>
            {item.id}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'classic' ? '#1A6B32' : '#0066FF' }]}>
            <Text style={styles.typeBadgeText}>{item.type === 'classic' ? 'SPP' : 'BLE'}</Text>
          </View>
          <RssiBar rssi={item.rssi} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, Shadow.neoSmall]}>
                {isScanning ? (
                  <BluetoothSearching size={20} color="#fff" strokeWidth={2.5} />
                ) : (
                  <Bluetooth size={20} color="#fff" strokeWidth={2.5} />
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>DISPOSITIVOS</Text>
                <View style={styles.scanStatus}>
                  {isScanning ? (
                    <>
                      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                      <Text style={styles.scanningLabel}>ESCANEANDO</Text>
                    </>
                  ) : (
                    <Text style={styles.scanCountLabel}>
                      {visibleDevices.length} encontrado(s)
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, Shadow.neoSmall]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar dispositivo..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Filtro novos / pareados */}
          <View style={styles.filterRow}>
            {([
              { key: 'todos', label: 'TODOS' },
              { key: 'novos', label: 'NOVOS' },
              { key: 'pareados', label: 'PAREADOS' },
            ] as { key: FilterMode; label: string }[]).map((f) => {
              const active = filterMode === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilterMode(f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Lista */}
          {isConnecting ? (
            <View style={[styles.connectingRow, Shadow.neoSmall]}>
              <ActivityIndicator size="small" color={Colors.dark} />
              <Text style={styles.connectingText}>CONECTANDO...</Text>
            </View>
          ) : visibleDevices.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, Shadow.neoSmall]}>
                <BluetoothSearching size={28} color="#555" strokeWidth={2} />
              </View>
              <Text style={styles.emptyText}>
                {isScanning
                  ? 'Procurando dispositivos...'
                  : scannedDevices.length === 0
                  ? 'Nenhum dispositivo encontrado'
                  : 'Nenhum dispositivo corresponde à busca/filtro'}
              </Text>
              {!isScanning && (
                <TouchableOpacity
                  style={[styles.rescanBtn, Shadow.neoSmall]}
                  onPress={startScan}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rescanText}>ESCANEAR NOVAMENTE</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={visibleDevices}
              keyExtractor={(d) => d.id}
              renderItem={renderDevice}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Safe area bottom */}
          <View style={{ height: 56, backgroundColor: Colors.bg }} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderWidth: 3,
    borderColor: Colors.dark,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '72%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#0066FF',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 18,
    color: Colors.dark,
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  scanningLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.green,
    fontWeight: '700',
  },
  scanCountLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#777',
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.dark,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  filterChipActive: {
    backgroundColor: Colors.dark,
  },
  filterChipText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 10,
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  divider: {
    height: 3,
    backgroundColor: Colors.dark,
    marginHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    marginBottom: 8,
  },
  deviceRowHighlighted: {
    backgroundColor: '#FFF8DC',
    borderColor: Colors.yellow,
    borderWidth: 3,
  },
  deviceIconBox: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceInfo: {
    flex: 1,
    minWidth: 0,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  deviceName: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
  },
  recognizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: Colors.yellow,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  recognizedBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: 7,
    color: Colors.dark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deviceId: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  typeBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rssiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 20,
  },
  rssiBar: {
    width: 4,
    borderWidth: 1,
    borderColor: Colors.dark,
    borderRadius: 1,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  connectingText: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: Colors.dark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#e0d8c8',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  rescanBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
    marginTop: 4,
  },
  rescanText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
  },
});
