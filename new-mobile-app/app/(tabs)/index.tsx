import { StyleSheet } from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        Welcome to ML Potato Disease Detector
      </ThemedText>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.subtitle}>How to use:</ThemedText>

        <ThemedText style={styles.text}>1. Go to the Detect tab</ThemedText>

        <ThemedText style={styles.text}>
          2. Take a photo of a potato plant leaf or select one from your gallery
        </ThemedText>

        <ThemedText style={styles.text}>
          3. Wait for the AI to analyze the image
        </ThemedText>

        <ThemedText style={styles.text}>
          4. View the detection results
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.subtitle}>Detectable Diseases:</ThemedText>

        <ThemedText style={styles.text}>• Early Blight</ThemedText>

        <ThemedText style={styles.text}>• Late Blight</ThemedText>

        <ThemedText style={styles.text}>• Healthy Plant</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.2)",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
});
