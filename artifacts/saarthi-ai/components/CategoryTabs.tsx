import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { MotionPressable } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";
import {
  getServiceGroupLabel,
  serviceGroupFilters,
  type ServiceGroupFilter,
} from "@/data/serviceGroups";
import { useColors } from "@/hooks/useColors";

export function CategoryTabs({
  selected,
  onSelect,
}: {
  selected?: ServiceGroupFilter;
  onSelect: (filter: ServiceGroupFilter) => void;
}) {
  const c = useColors();
  const { language } = useLanguage();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
      style={styles.scroller}
    >
      {serviceGroupFilters.map((filter) => {
        const isSelected = filter === selected;
        const label = getServiceGroupLabel(filter, language);

        return (
          <MotionPressable
            key={filter}
            testID={`category-tab-${filter}`}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(filter)}
            style={[
              styles.tab,
              isSelected
                ? { backgroundColor: c.primary, borderColor: c.primary }
                : { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.tabText,
                { color: isSelected ? c.primaryForeground : c.foreground },
              ]}
            >
              {label}
            </Text>
          </MotionPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Bleed to the screen edge so the last tab can scroll fully into view
  // inside the screens' 20px horizontal padding.
  scroller: {
    marginHorizontal: -20,
    flexGrow: 0,
  },
  row: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  tab: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
