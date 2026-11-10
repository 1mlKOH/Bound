import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { Haptics } from '../utils/haptics';

export interface DropdownMenuItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  active?: boolean;
  badge?: string;
  separatorBefore?: boolean;
  onSelect: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  children?: React.ReactNode;
  trigger?: (props: { open: () => void; isOpen: boolean }) => React.ReactNode;
  align?: 'end' | 'start';
  minWidth?: number;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  children,
  trigger,
  align = 'end',
  minWidth = 224,
}) => {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState<{ top: number; right?: number; left?: number; openAbove?: boolean }>({
    top: 0,
    right: 16,
  });

  const triggerRef = useRef<React.ElementRef<typeof View>>(null);
  const animProgress = useRef(new Animated.Value(0)).current;

  const openMenu = useCallback(() => {
    Haptics.selectionAsync();

    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;

        // Estimated menu height: ~56px per item + padding + separators
        const estimatedHeight = items.length * 56 + 20;
        const openAbove = y + height + estimatedHeight > windowHeight - 40;

        const top = openAbove ? Math.max(16, y - estimatedHeight - 6) : y + height + 6;

        if (align === 'end') {
          const right = Math.max(16, windowWidth - (x + width));
          setMenuLayout({ top, right, openAbove });
        } else {
          const left = Math.max(16, x);
          setMenuLayout({ top, left, openAbove });
        }

        setIsOpen(true);
        Animated.parallel([
          Animated.spring(animProgress, {
            toValue: 1,
            damping: 18,
            stiffness: 280,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [items.length, align, animProgress]);

  const closeMenu = useCallback(
    (onComplete?: () => void) => {
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 110,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
        if (onComplete) {
          onComplete();
        }
      });
    },
    [animProgress]
  );

  const handleSelect = (item: DropdownMenuItem) => {
    Haptics.selectionAsync();
    closeMenu(() => {
      item.onSelect();
    });
  };

  const scale = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const opacity = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.7, 1],
  });

  const translateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [menuLayout.openAbove ? 6 : -6, 0],
  });

  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isDark ? 0.35 : 0.16],
  });

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        {trigger ? (
          trigger({ open: openMenu, isOpen })
        ) : (
          <Pressable onPress={openMenu}>{children}</Pressable>
        )}
      </View>

      <Modal
        visible={isOpen}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <View style={StyleSheet.absoluteFill}>
          {/* Dismissal Backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: '#000000',
                  opacity: backdropOpacity,
                },
              ]}
            />
          </Pressable>

          {/* Anchored Popover Menu Container */}
          <Animated.View
            style={[
              styles.menuCard,
              {
                top: menuLayout.top,
                right: menuLayout.right,
                left: menuLayout.left,
                minWidth,
                backgroundColor: colors.card,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.10)'
                  : 'rgba(0, 0, 0, 0.08)',
                shadowColor: colors.cardShadow,
                opacity,
                transform: [{ scale }, { translateY }],
              },
            ]}
          >
            {items.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;

              return (
                <React.Fragment key={item.key}>
                  {item.separatorBefore && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: colors.divider },
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.menuItem,
                      isFirst && styles.firstItem,
                      isLast && styles.lastItem,
                    ]}
                  >
                    {/* Item Icon */}
                    {item.icon && (
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: item.active
                              ? isDark
                                ? 'rgba(245, 158, 11, 0.18)'
                                : 'rgba(245, 158, 11, 0.14)'
                              : colors.actionBg,
                          },
                        ]}
                      >
                        {item.icon}
                      </View>
                    )}

                    {/* Text block: Label & Subtitle */}
                    <View style={styles.textContainer}>
                      <View style={styles.labelRow}>
                        <Text
                          style={[
                            styles.label,
                            {
                              color: item.destructive
                                ? colors.statusDanger
                                : item.active
                                ? isDark
                                  ? '#FFB020'
                                  : '#D97706'
                                : colors.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>

                        {item.badge && (
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: isDark
                                  ? 'rgba(245, 158, 11, 0.20)'
                                  : 'rgba(245, 158, 11, 0.16)',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                {
                                  color: isDark ? '#FFB020' : '#D97706',
                                },
                              ]}
                            >
                              {item.badge}
                            </Text>
                          </View>
                        )}
                      </View>

                      {item.description && (
                        <Text
                          style={[
                            styles.description,
                            { color: colors.textMuted },
                          ]}
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuCard: {
    position: 'absolute',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderCurve: 'continuous',
    minHeight: 46,
  },
  firstItem: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  lastItem: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.15,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: undefined,
    }),
  },
  description: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1.5,
    letterSpacing: -0.1,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: undefined,
    }),
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 6,
  },
});
