let BoundWidgetsNative: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const expoModules = typeof require !== 'undefined' ? require('expo-modules-core') : null;
  if (expoModules && typeof expoModules.requireNativeModule === 'function') {
    BoundWidgetsNative = expoModules.requireNativeModule('BoundWidgets');
  }
} catch {
  // Graceful fallback if native module is not yet compiled into client or in test runner
}

export interface BoundWidgetSessionItem {
  sessionId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent' | 'cancelled' | null;
  percentage: number;
  statusColor: string;
  statusLabel: string;
}

export interface BoundWidgetSubjectItem {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  attended: number;
  absent: number;
  totalHeld: number;
  percentage: number;
  effectiveTarget: number;
  tier: 'safe' | 'warning' | 'danger' | 'neutral';
  statusLabel: string;
}

export interface BoundWidgetSnapshot {
  isPro: boolean;
  date: string;
  formattedDate: string;
  unmarkedCount: number;
  totalSessions: number;
  isHoliday: boolean;
  holidayLabel?: string | null;
  overallPercentage: number;
  overallStatus: 'safe' | 'close' | 'below';
  targetPercentage: number;
  sessions: BoundWidgetSessionItem[];
  subjects: BoundWidgetSubjectItem[];
}

export function updateWidgetSnapshot(snapshot: BoundWidgetSnapshot): boolean {
  if (!BoundWidgetsNative) return false;
  try {
    return Boolean(BoundWidgetsNative.updateSnapshot(JSON.stringify(snapshot)));
  } catch (err) {
    console.warn('[BoundWidgets] Failed to update snapshot:', err);
    return false;
  }
}

export function setWidgetProStatus(isPro: boolean): boolean {
  if (!BoundWidgetsNative) return false;
  try {
    return Boolean(BoundWidgetsNative.setEntitlementStatus(isPro));
  } catch (err) {
    console.warn('[BoundWidgets] Failed to set Pro status:', err);
    return false;
  }
}

export function getWidgetProStatus(): boolean {
  if (!BoundWidgetsNative) return true;
  try {
    const val = BoundWidgetsNative.getEntitlementStatus();
    return typeof val === 'boolean' ? val : true;
  } catch {
    return true;
  }
}

export async function requestWidgetUpdate(): Promise<boolean> {
  if (!BoundWidgetsNative) return false;
  try {
    return await BoundWidgetsNative.requestWidgetUpdate();
  } catch {
    return false;
  }
}

export async function pinSubjectWidget(subjectId: string = 'auto'): Promise<boolean> {
  if (!BoundWidgetsNative || typeof BoundWidgetsNative.pinSubjectWidget !== 'function') {
    return false;
  }
  try {
    return Boolean(await BoundWidgetsNative.pinSubjectWidget(subjectId));
  } catch (err) {
    console.warn('[BoundWidgets] Failed to pin subject widget:', err);
    return false;
  }
}
