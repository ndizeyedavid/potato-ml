import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    (async () => {
      try {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          Alert.alert(
            "Location Permission Denied",
            "Please enable location permissions in your device settings to use the map feature."
          );
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location);

        // Set map region to current location
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setErrorMsg("Error getting location");
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please try again."
        );
      }
    })();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(
      4
    )}, Lng: ${location.coords.longitude.toFixed(4)}`;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: textColor }]}>
          Location Map
        </ThemedText>
        <ThemedView style={styles.locationInfo}>
          <ThemedText style={[styles.locationText, { color: textColor }]}>
            {text}
          </ThemedText>
          {location && (
            <ThemedText style={[styles.accuracyText, { color: textColor }]}>
              Accuracy: {location.coords.accuracy?.toFixed(2) || "N/A"} meters
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
          loadingEnabled={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description={`Accuracy: ${
                location.coords.accuracy?.toFixed(2) || "N/A"
              } meters`}
            />
          )}
        </MapView>
      </View>

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: textColor }]}>
          {location
            ? "Map centered on your current location"
            : "Getting your location..."}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  locationInfo: {
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  accuracyText: {
    fontSize: 14,
    opacity: 0.8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
});
