import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Minimize2, FlipHorizontal2, FlipVertical2 } from 'lucide-react-native';
import MicrobitTiltVisual, { TiltDirection } from './MicrobitTiltVisual';
import MobileRotateIcon from './icons/MobileRotateIcon';
import { Colors, FontFamily } from '../constants/theme';
import { getCmdColor } from '../utils/cmdColor';

interface Props {
  visible: boolean;
  onClose: () => void;
  x: number;
  y: number;
  direction: TiltDirection;
  isLandscape: boolean;
  onToggleOrientation: () => void;
  activeCmd: string;
  invertVertical: boolean;
  invertHorizontal: boolean;
  onToggleInvertVertical: () => void;
  onToggleInvertHorizontal: () => void;
}

export default function AccelerometerFullscreenModal({
  visible, onClose, x, y, direction, isLandscape, onToggleOrientation, activeCmd,
  invertVertical, invertHorizontal, onToggleInvertVertical, onToggleInvertHorizontal,
}: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Menor dimensão da tela como referência — mesmo tamanho visual do
  // simulador em portrait e landscape (useWindowDimensions já reflete a
  // troca de width/height quando ScreenOrientation.lockAsync gira o device).
  const shortSide = Math.min(width, height);
  const size = Math.min(shortSide * 0.65, 340);

  // Trava numa orientação ESPECÍFICA enquanto o modal está visível — o lock
  // genérico "LANDSCAPE" da tela pai permite o aparelho girar sozinho entre
  // paisagem-esquerda/direita, e como o usuário está ativamente inclinando o
  // celular (é o ponto da feature), isso dispara giros de 180° de verdade.
  useEffect(() => {
    if (!visible) return;
    const lock = isLandscape
      ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      : ScreenOrientation.OrientationLock.PORTRAIT_UP;
    ScreenOrientation.lockAsync(lock).catch(() => {});
  }, [visible, isLandscape]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      // Declara só a orientação atual — evita que o Modal rotacione sozinho
      // no iOS mesmo com o lock nativo acima.
      supportedOrientations={[isLandscape ? 'landscape' : 'portrait']}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} hidden={isLandscape} />
      <View style={styles.backdrop}>
        <View style={styles.center}>
          <MicrobitTiltVisual
            x={x}
            y={y}
            direction={direction}
            isLandscape={isLandscape}
            invertVertical={invertVertical}
            invertHorizontal={invertHorizontal}
            size={size}
          />
        </View>

        {/* Widget: comando atual em execução */}
        <View style={[styles.cmdWidget, { bottom: insets.bottom + 24 }]}>
          <View style={[styles.cmdDot, { backgroundColor: activeCmd ? getCmdColor(activeCmd) : '#555' }]} />
          <Text style={styles.cmdWidgetText}>
            {activeCmd ? activeCmd.toUpperCase() : 'UP'}
          </Text>
        </View>

        {/* Botão: fechar/minimizar */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.iconBtn, styles.closeBtn, { top: insets.top + 16, left: insets.left + 16 }]}
          activeOpacity={0.8}
        >
          <Minimize2 size={20} color={Colors.dark} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Botão: rotacionar — reusa o toggle/isLandscape já existente na tela pai */}
        <TouchableOpacity
          onPress={onToggleOrientation}
          style={[styles.iconBtn, styles.rotateBtn, { top: insets.top + 16, right: insets.right + 16 }]}
          activeOpacity={0.8}
        >
          <MobileRotateIcon color="#fff" width={24} height={24} />
        </TouchableOpacity>

        {/* Botão: inverter esquerda/direita — corrige orientações físicas em
            que o mapeamento de eixos do acelerômetro sai espelhado. */}
        <TouchableOpacity
          onPress={onToggleInvertHorizontal}
          style={[
            styles.iconBtn,
            { top: insets.top + 16 + 56, left: insets.left + 16 },
            invertHorizontal ? styles.invertBtnActive : styles.invertBtnInactive,
          ]}
          activeOpacity={0.8}
        >
          <FlipHorizontal2 size={20} color={invertHorizontal ? Colors.dark : '#fff'} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Botão: inverter cima/baixo */}
        <TouchableOpacity
          onPress={onToggleInvertVertical}
          style={[
            styles.iconBtn,
            { top: insets.top + 16 + 56, right: insets.right + 16 },
            invertVertical ? styles.invertBtnActive : styles.invertBtnInactive,
          ]}
          activeOpacity={0.8}
        >
          <FlipVertical2 size={20} color={invertVertical ? Colors.dark : '#fff'} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cmdWidget: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark,
    borderWidth: 2,
    borderColor: '#FFD82D',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cmdDot: { width: 8, height: 8, borderRadius: 4 },
  cmdWidgetText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 13,
    color: '#FFD82D',
    letterSpacing: 1,
  },
  iconBtn: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  closeBtn: { backgroundColor: '#fff' },
  rotateBtn: { backgroundColor: '#1C37B5' },
  invertBtnActive: { backgroundColor: '#FFD82D' },
  invertBtnInactive: { backgroundColor: '#555' },
});
