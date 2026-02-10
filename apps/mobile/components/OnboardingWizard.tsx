import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface OnboardingWizardProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  children: React.ReactNode;
}

export default function OnboardingWizard({
  currentStep,
  totalSteps,
  stepLabels,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  showBack = true,
  children,
}: OnboardingWizardProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      {/* Step dots */}
      <View style={styles.dotsRow}>
        {stepLabels.map((label, i) => (
          <View key={i} style={styles.dotItem}>
            <View
              style={[
                styles.dot,
                i < currentStep && styles.dotCompleted,
                i === currentStep && styles.dotActive,
              ]}
            >
              {i < currentStep ? (
                <Text style={styles.dotCheck}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.dotNum,
                    i === currentStep && styles.dotNumActive,
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.dotLabel,
                i === currentStep && styles.dotLabelActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {showBack && currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        {onNext && (
          <TouchableOpacity
            style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={nextDisabled}
          >
            <Text style={styles.nextButtonText}>{nextLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#F0EDE8",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#1A7A6D",
    borderRadius: 2,
  },
  stepIndicator: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#A39D94",
    marginTop: 6,
    textAlign: "right",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dotItem: {
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0EDE8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dotCompleted: {
    backgroundColor: "#1A7A6D",
  },
  dotActive: {
    backgroundColor: "#E8573D",
  },
  dotCheck: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  dotNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "#A39D94",
  },
  dotNumActive: {
    color: "#FFFFFF",
  },
  dotLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#A39D94",
  },
  dotLabelActive: {
    color: "#2A2622",
    fontFamily: "DMSans_500Medium",
  },
  content: {
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EDE8",
    backgroundColor: "#FDFCFA",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#615B53",
  },
  nextButton: {
    backgroundColor: "#E8573D",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
