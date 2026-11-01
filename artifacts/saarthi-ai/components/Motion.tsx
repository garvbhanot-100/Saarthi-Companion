import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

const ReducedMotionContext = createContext(true);

export function MotionProvider({ children }: React.PropsWithChildren) {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduceMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function FadeInView({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const reduceMotion = useContext(ReducedMotionContext);
  const opacity = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    if (started.current) return;

    started.current = true;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionPressable({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: PressableProps) {
  const reduceMotion = useContext(ReducedMotionContext);
  const scale = useRef(new Animated.Value(1)).current;
  const animatedStyle = {
    transform: [{ scale: reduceMotion ? 1 : scale }],
  };

  const pressIn: NonNullable<PressableProps["onPressIn"]> = (event) => {
    onPressIn?.(event);
    if (!reduceMotion) {
      Animated.spring(scale, {
        toValue: 0.985,
        speed: 30,
        bounciness: 2,
        useNativeDriver: true,
      }).start();
    }
  };

  const pressOut: NonNullable<PressableProps["onPressOut"]> = (event) => {
    onPressOut?.(event);
    if (!reduceMotion) {
      Animated.spring(scale, {
        toValue: 1,
        speed: 24,
        bounciness: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const resolvedStyle =
    typeof style === "function"
      ? (state: PressableStateCallbackType) => [style(state), animatedStyle]
      : [style, animatedStyle];

  return (
    <AnimatedPressable
      {...props}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={resolvedStyle}
    >
      {children}
    </AnimatedPressable>
  );
}

export function TypingIndicator({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  const reduceMotion = useContext(ReducedMotionContext);
  const dots = [0, 1, 2] as const;
  const values = useRef(dots.map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    if (reduceMotion) {
      values.forEach((value) => value.setValue(1));
      return;
    }

    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 130),
          Animated.timing(value, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.delay(250),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());

    return () => animations.forEach((animation) => animation.stop());
  }, [reduceMotion, values]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
    >
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            opacity: reduceMotion ? 1 : value,
            transform: [
              {
                scale: reduceMotion
                  ? 1
                  : value.interpolate({
                      inputRange: [0.35, 1],
                      outputRange: [0.85, 1.1],
                    }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
