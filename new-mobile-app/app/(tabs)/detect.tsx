import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

const { width } = Dimensions.get("window");

// Configure axios defaults
const API_URL = "http://192.168.0.225:8000";
axios.defaults.baseURL = API_URL;

interface Prediction {
  disease: string;
  confidence: string;
}

export default function DetectScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to use this feature."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzePotato(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to use this feature."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzePotato(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const analyzePotato = async (imageUri: string) => {
    setLoading(true);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "potato.jpg",
      } as any);

      const response = await axios.post("/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.class) {
        setPrediction({
          disease: response.data.class,
          confidence: (response.data.confidence * 100).toFixed(2),
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        "Failed to analyze image. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPrediction(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Potato Disease Detection</ThemedText>

      {image ? (
        <View style={styles.resultContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={clearImage}>
            <ThemedText style={styles.closeButtonText}>×</ThemedText>
          </TouchableOpacity>
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
          />

          {loading ? (
            <ActivityIndicator size="large" style={styles.loading} />
          ) : prediction ? (
            <View style={styles.predictionContainer}>
              <ThemedText style={styles.predictionText}>
                Disease: {prediction.disease}
              </ThemedText>
              <ThemedText style={styles.predictionText}>
                Confidence: {prediction.confidence}%
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : (
        <ThemedText style={styles.instructions}>
          Take a photo or select an image of a potato plant leaf to detect
          disease
        </ThemedText>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <ThemedText style={styles.buttonText}>Camera</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <ThemedText style={styles.buttonText}>Gallery</ThemedText>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
    position: "absolute",
    top: 60,
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructions: {
    textAlign: "center",
    marginHorizontal: 40,
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#ff4444",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  predictionContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  predictionText: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 5,
  },
  loading: {
    marginTop: 20,
  },
});
