import * as ExpoHaptics from 'expo-haptics';
import { useAttendanceStore } from '../store/useAttendanceStore';

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

export const Haptics = {
  ImpactFeedbackStyle: ExpoHaptics.ImpactFeedbackStyle,
  NotificationFeedbackType: ExpoHaptics.NotificationFeedbackType,

  impactAsync: async (style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Medium) => {
    const enabled = useAttendanceStore.getState().settings?.hapticFeedbackEnabled ?? true;
    if (!enabled) return;
    try {
      return await ExpoHaptics.impactAsync(style);
    } catch {
      // ignore
    }
  },

  selectionAsync: async () => {
    const enabled = useAttendanceStore.getState().settings?.hapticFeedbackEnabled ?? true;
    if (!enabled) return;
    try {
      return await ExpoHaptics.selectionAsync();
    } catch {
      // ignore
    }
  },

  notificationAsync: async (type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success) => {
    const enabled = useAttendanceStore.getState().settings?.hapticFeedbackEnabled ?? true;
    if (!enabled) return;
    try {
      return await ExpoHaptics.notificationAsync(type);
    } catch {
      // ignore
    }
  },
};

export default Haptics;
