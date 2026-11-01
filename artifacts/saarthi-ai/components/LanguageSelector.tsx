import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { languages } from "@/constants/languages";
import { useLanguage } from "@/context/LanguagesContext";
import { useColors } from "@/hooks/useColors";

export default function LanguageSelector() {
  const c = useColors();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const selectedLanguage =
    languages.find((item) => item.code === language) ?? languages[0];

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: c.card,
            borderColor: c.border,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: c.primarySoft,
              },
            ]}
          >
            <Feather name="globe" size={18} color={c.primary} />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: c.foreground,
                },
              ]}
            >
              {t("profileLanguageTitle")}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: c.mutedForeground,
                },
              ]}
            >
              {t("profileLanguageDescription")}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileChooseLanguage")}
          onPress={() => setOpen(true)}
          style={[
            styles.selector,
            {
              backgroundColor: c.background,
              borderColor: c.border,
            },
          ]}
        >
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.selectedNative,
                {
                  color: c.foreground,
                },
              ]}
            >
              {selectedLanguage.nativeName}
            </Text>

            <Text
              style={[
                styles.selectedEnglish,
                {
                  color: c.mutedForeground,
                },
              ]}
            >
              {selectedLanguage.name}
            </Text>
          </View>

          <Feather
            name="chevron-down"
            size={18}
            color={c.mutedForeground}
          />
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: c.card,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: c.foreground,
                    },
                  ]}
                >
                  {t("profileChooseLanguage")}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color: c.mutedForeground,
                    },
                  ]}
                >
                  {t("profileSelectLanguage")}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("profileCloseLanguagePicker")}
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <Feather
                  name="x"
                  size={21}
                  color={c.mutedForeground}
                />
              </Pressable>
            </View>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item.code === language;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.nativeName}
                    onPress={() => {
                      setLanguage(item.code);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected
                          ? c.primarySoft
                          : c.background,
                        borderColor: selected
                          ? c.primary
                          : c.border,
                      },
                    ]}
                  >
                    <View style={styles.textContainer}>
                      <Text
                        style={[
                          styles.optionNative,
                          {
                            color: c.foreground,
                          },
                        ]}
                      >
                        {item.nativeName}
                      </Text>

                      <Text
                        style={[
                          styles.optionEnglish,
                          {
                            color: c.mutedForeground,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {selected && (
                      <Feather
                        name="check-circle"
                        size={20}
                        color={c.primary}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },

  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 3,
  },

  selector: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedNative: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  selectedEnglish: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 2,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "82%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
  },

  modalSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  option: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  optionNative: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  optionEnglish: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 3,
  },
});