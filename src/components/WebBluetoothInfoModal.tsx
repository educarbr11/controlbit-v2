import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { BluetoothOff, TriangleAlert, X } from 'lucide-react-native';
import { Colors, FontFamily, Shadow } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../i18n/translations';

export type WebBluetoothInfoReason =
  | 'no-web-bluetooth'
  | 'insecure-context'
  | 'classic-not-supported'
  | 'connect-error';

interface Props {
  reason: WebBluetoothInfoReason;
  onClose: () => void;
}

const REASON_KEYS: Record<WebBluetoothInfoReason, { title: TranslationKey; body: TranslationKey }> = {
  'no-web-bluetooth': { title: 'web_bt_unsupported_title', body: 'web_bt_unsupported_body' },
  'insecure-context': { title: 'web_bt_insecure_context_title', body: 'web_bt_insecure_context_body' },
  'classic-not-supported': { title: 'web_bt_classic_unsupported_title', body: 'web_bt_classic_unsupported_body' },
  'connect-error': { title: 'web_bt_connect_error_title', body: 'web_bt_connect_error_body' },
};

export default function WebBluetoothInfoModal({ reason, onClose }: Props) {
  const { t } = useLanguage();
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const { title, body } = REASON_KEYS[reason];

  return (
    <Modal transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, Shadow.neoSmall]}>
                {reason === 'no-web-bluetooth' ? (
                  <BluetoothOff size={22} color="#fff" strokeWidth={2.5} />
                ) : (
                  <TriangleAlert size={22} color="#fff" strokeWidth={2.5} />
                )}
              </View>
              <Text style={styles.headerTitle}>{t(title)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, Shadow.neoSmall]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            <Text style={styles.bodyText}>{t(body)}</Text>
          </View>

          <View style={styles.footer}>
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={styles.btnShadow} />
              <TouchableOpacity style={styles.okBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.okText}>{t('web_bt_ok')}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: Colors.dark,
    letterSpacing: 0.3,
    flex: 1,
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
  divider: {
    height: 3,
    backgroundColor: Colors.dark,
    marginHorizontal: 20,
  },
  body: {
    padding: 20,
  },
  bodyText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.dark,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
  },
  btnShadow: {
    position: 'absolute',
    top: 4, left: 4, right: -4, bottom: -4,
    backgroundColor: Colors.dark,
  },
  okBtn: {
    backgroundColor: '#0066FF',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
  },
});
