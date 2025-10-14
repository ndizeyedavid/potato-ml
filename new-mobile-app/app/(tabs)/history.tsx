import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useScanHistory } from "../../contexts/ScanHistoryContext";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const { scanHistory, deleteScan, clearHistory } = useScanHistory();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to delete this scan record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScan(id),
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all scan records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearHistory,
        },
      ]
    );
  };

  const renderScanItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.scanItem}>
      <View style={styles.scanHeader}>
        <ThemedText style={styles.scanDate}>
          {new Date(item.timestamp).toLocaleString()}
        </ThemedText>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDelete(item.id)}
          >
            <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scanContent}>
        <Image source={{ uri: item.imageUri }} style={styles.scanImage} />
        <View style={styles.scanDetails}>
          <ThemedText style={styles.detailText}>
            <ThemedText style={styles.detailLabel}>Disease: </ThemedText>
            {item.disease}
          </ThemedText>
          <ThemedText style={styles.detailText}>
            <ThemedText style={styles.detailLabel}>Confidence: </ThemedText>
            {item.confidence}%
          </ThemedText>
          {item.location && (
            <>
              <ThemedText style={styles.detailText}>
                <ThemedText style={styles.detailLabel}>Latitude: </ThemedText>
                {item.location.latitude.toFixed(6)}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                <ThemedText style={styles.detailLabel}>Longitude: </ThemedText>
                {item.location.longitude.toFixed(6)}
              </ThemedText>
              <ThemedText style={styles.detailText}>
                <ThemedText style={styles.detailLabel}>Accuracy: </ThemedText>
                {item.location.accuracy?.toFixed(2) || "N/A"} meters
              </ThemedText>
            </>
          )}
        </View>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Scan History
      </ThemedText>

      {scanHistory.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No scan history yet. Perform a scan to see results here.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={scanHistory.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )}
            renderItem={renderScanItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  headerActions: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  scanItem: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
    paddingBottom: 10,
  },
  scanDate: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 3,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scanContent: {
    flexDirection: "row",
  },
  scanImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 10,
    marginRight: 15,
  },
  scanDetails: {
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: "bold",
  },
});
