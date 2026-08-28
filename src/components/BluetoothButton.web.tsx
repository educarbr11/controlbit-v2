import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
} from 'lucide-react-native';
import { useBluetooth } from '../context/BluetoothContext';
import WebBluetoothInfoModal, { WebBluetoothInfoReason } from './WebBluetoothInfoModal';
import { Colors, FontFamily, Shadow } from '../constants/theme';

/**
 * Botão de conexão Bluetooth para a versão web — clicar já dispara o picker
 * nativo do navegador (Web Bluetooth exige gesto do usuário e não tem scan
 * contínuo/lista customizada como no app nativo).
 */
export default function BluetoothStatusButton() {
  const {
    status, device, disconnect, startScan, unsupportedReason, lastError,
  } = useBluetooth();
  const [infoReason, setInfoReason] = useState<WebBluetoothInfoReason | null>(null);

  const handlePress = async () => {
    if (status === 'connected') {
      disconnect();
      return;
    }
    if (status === 'connecting') return;

    if (unsupportedReason) {
      setInfoReason(unsupportedReason);
      return;
    }

    await startScan();
  };

  // Mostra o erro de conexão assim que ele aparecer no contexto.
  React.useEffect(() => {
    if (lastError === 'connect-error') setInfoReason('connect-error');
  }, [lastError]);

  const getBg = () => {
    if (status === 'connected') return '#00C851';
    if (status === 'connecting') return '#FFE500';
    return '#FF2D2D';
  };

  const getIcon = () => {
    if (status === 'connected')
      return <BluetoothConnected size={16} color="#fff" strokeWidth={2.5} />;
    if (status === 'connecting')
      return <BluetoothSearching size={16} color={Colors.dark} strokeWidth={2.5} />;
    return <BluetoothOff size={16} color="#fff" strokeWidth={2.5} />;
  };

  const getLabel = () => {
    if (status === 'connected')
      return device?.name?.replace('micro:bit ', '') || 'BIT';
    if (status === 'connecting') return '...';
    return 'BLE';
  };

  const labelColor = status === 'connecting' ? Colors.dark : '#fff';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.btn, { backgroundColor: getBg() }, Shadow.neoSmall]}
        activeOpacity={0.85}
        disabled={status === 'connecting'}
      >
        {getIcon()}
        <Text style={[styles.label, { color: labelColor }]}>{getLabel()}</Text>
      </TouchableOpacity>

      {infoReason && (
        <WebBluetoothInfoModal reason={infoReason} onClose={() => setInfoReason(null)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  label: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
  },
});
