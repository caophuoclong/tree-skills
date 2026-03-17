import { useTheme } from "@/src/ui/tokens";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function FABButton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuOptions = [
    {
      icon: "flash",
      label: "Log hoạt động",
      color: colors.career,
      onPress: () => {
        setMenuVisible(false);
        router.push("/(tabs)/quests");
      },
    },
    {
      icon: "star",
      label: "Quest gợi ý",
      color: colors.softskills,
      onPress: () => {
        setMenuVisible(false);
        router.push("/(tabs)/quests");
      },
    },
    {
      icon: "happy",
      label: "Check-in tâm trạng",
      color: colors.wellbeing,
      onPress: () => {
        setMenuVisible(false);
        router.push("/(tabs)");
      },
    },
  ];

  return (
    <View style={styles.fabContainer}>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: `${option.color}20` },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={option.color}
                  />
                </View>
                <Text style={styles.menuLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Ionicons
            name={menuVisible ? "close" : "add"}
            size={28}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Foundation name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: "Kỹ năng",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="code-branch" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fab-placeholder"
        options={{
          title: "",
          tabBarButton: () => <FABButton />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: "Nhiệm vụ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-done-circle-sharp"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="user-large" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    fabContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    fab: {
      marginBottom: 12,
    },
    fabInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.brandPrimary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.brandPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    menuContent: {
      backgroundColor: colors.bgSurface,
      width: "90%",
      borderRadius: 24,
      padding: 16,
      marginBottom: 100, // Above the tab bar
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      gap: 16,
    },
    menuIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    menuLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });
