import React, { useState, useEffect } from "react";
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
import * as Location from "expo-location";
import axios from "axios";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useScanHistory } from "../../contexts/ScanHistoryContext";

const { width } = Dimensions.get("window");

// Configure axios defaults
const API_URL = "https://potato-ml-jgsa.onrender.com";
axios.defaults.baseURL = API_URL;

interface Prediction {
  disease: string;
  confidence: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export default function DetectScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { addScan } = useScanHistory();

  useEffect(() => {
    // Request location permission when component mounts
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          return;
        }
      } catch (error) {
        console.error("Location permission error:", error);
        setLocationError("Failed to request location permission");
      }
    })();
  }, []);

  const getLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      setLocationError(null);
      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Failed to get current location");
      return null;
    }
  };

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
      // Get current location before analysis
      await getLocation();

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
        const predictionResult = {
          disease: response.data.class,
          confidence: (response.data.confidence * 100).toFixed(2),
        };

        setPrediction(predictionResult);

        // Save to history using context
        const scanRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          imageUri: imageUri,
          disease: predictionResult.disease,
          confidence: predictionResult.confidence,
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
              }
            : undefined,
        };

        addScan(scanRecord);
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
    setLocation(null);
    setLocationError(null);
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

              {/* Location Information */}
              <View style={styles.locationContainer}>
                <ThemedText style={styles.locationTitle}>
                  Location Information
                </ThemedText>
                {locationError ? (
                  <ThemedText style={styles.locationErrorText}>
                    {locationError}
                  </ThemedText>
                ) : location ? (
                  <>
                    <ThemedText style={styles.locationText}>
                      Latitude: {location.latitude.toFixed(6)}
                    </ThemedText>
                    <ThemedText style={styles.locationText}>
                      Longitude: {location.longitude.toFixed(6)}
                    </ThemedText>
                    <ThemedText style={styles.locationText}>
                      Accuracy: {location.accuracy?.toFixed(2) || "N/A"} meters
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText style={styles.locationText}>
                    Getting location...
                  </ThemedText>
                )}
              </View>
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
    width: width * 0.8,
  },
  predictionText: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 5,
  },
  locationContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    marginTop: 10,
    paddingTop: 10,
  },
  locationTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  locationText: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 2,
  },
  locationErrorText: {
    color: "#ff9999",
    fontSize: 14,
    fontStyle: "italic",
  },
  loading: {
    marginTop: 20,
  },
});
