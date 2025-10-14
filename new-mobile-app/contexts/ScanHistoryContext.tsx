import React, { createContext, useContext, useState, ReactNode } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  imageUri: string;
  disease: string;
  confidence: string;
  location?: LocationData;
}

interface ScanHistoryContextType {
  scanHistory: ScanRecord[];
  addScan: (scan: ScanRecord) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
}

const ScanHistoryContext = createContext<ScanHistoryContextType | undefined>(
  undefined
);

export const ScanHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  const addScan = (scan: ScanRecord) => {
    setScanHistory((prev) => [scan, ...prev]);
  };

  const deleteScan = (id: string) => {
    setScanHistory((prev) => prev.filter((scan) => scan.id !== id));
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <ScanHistoryContext.Provider
      value={{ scanHistory, addScan, deleteScan, clearHistory }}
    >
      {children}
    </ScanHistoryContext.Provider>
  );
};

export const useScanHistory = () => {
  const context = useContext(ScanHistoryContext);
  if (context === undefined) {
    throw new Error("useScanHistory must be used within a ScanHistoryProvider");
  }
  return context;
};
