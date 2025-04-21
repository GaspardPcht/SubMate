import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text as PaperText, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface InterestSimulationProps {
  totalSavings: number;
  projectionYears: 1 | 5 | 10;
  setProjectionYears: (years: 1 | 5 | 10) => void;
  interestSimulation: any; // Adjust type as necessary
  showInterestSimulation: boolean;
  toggleInterestSimulation: () => void;
}

const InterestSimulation: React.FC<InterestSimulationProps> = ({
  totalSavings,
  projectionYears,
  setProjectionYears,
  interestSimulation,
  showInterestSimulation,
  toggleInterestSimulation,
}) => {
  return (
    <View style={styles.chartCardContent}>
      {showInterestSimulation && totalSavings > 0 && (
        <View style={styles.chartContainer}>
          <View style={styles.simulationGraphicContainer}>
            <MaterialCommunityIcons
              name="calculator"
              size={48}
              color="#377AF2"
            />
            <PaperText style={styles.simulationTitle}>
              Simulation des intérêts
            </PaperText>
          </View>

          <View style={styles.projectionTabs}>
            {/* Onglet 1 an */}
            <TouchableOpacity
              style={
                projectionYears === 1
                  ? { ...styles.projectionTab, ...styles.projectionTabActive }
                  : styles.projectionTab
              }
              onPress={() => setProjectionYears(1)}
            >
              <PaperText
                style={
                  projectionYears === 1
                    ? {
                        ...styles.projectionTabText,
                        ...styles.projectionTabTextActive,
                      }
                    : styles.projectionTabText
                }
              >
                1 an
              </PaperText>
            </TouchableOpacity>

            {/* Onglet 5 ans */}
            <TouchableOpacity
              style={
                projectionYears === 5
                  ? { ...styles.projectionTab, ...styles.projectionTabActive }
                  : styles.projectionTab
              }
              onPress={() => setProjectionYears(5)}
            >
              <PaperText
                style={
                  projectionYears === 5
                    ? {
                        ...styles.projectionTabText,
                        ...styles.projectionTabTextActive,
                      }
                    : styles.projectionTabText
                }
              >
                5 ans
              </PaperText>
            </TouchableOpacity>

            {/* Onglet 10 ans */}
            <TouchableOpacity
              style={
                projectionYears === 10
                  ? { ...styles.projectionTab, ...styles.projectionTabActive }
                  : styles.projectionTab
              }
              onPress={() => setProjectionYears(10)}
            >
              <PaperText
                style={
                  projectionYears === 10
                    ? {
                        ...styles.projectionTabText,
                        ...styles.projectionTabTextActive,
                      }
                    : styles.projectionTabText
                }
              >
                10 ans
              </PaperText>
            </TouchableOpacity>
          </View>

          <PaperText style={styles.chartFooter}>
            Projection sur {projectionYears}{" "}
            {projectionYears === 1 ? "an" : "ans"} selon les taux de chaque
            livret
          </PaperText>

          <View style={styles.interestSummaryContainer}>
            <View style={styles.interestSummaryHeader}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={22}
                color="#377AF2"
              />
              <PaperText style={styles.interestSummaryTitle}>
                Intérêts cumulés sur {projectionYears}{" "}
                {projectionYears === 1 ? "an" : "ans"}
              </PaperText>
            </View>

            <View style={styles.interestSummaryContent}>
              {Object.entries(interestSimulation.totalInterestsByType).map(
                ([type, interest]) => {
                  return (
                    <View
                      key={`interest-summary-${type}`}
                      style={styles.interestSummaryRow}
                    >
                      <View style={styles.interestSummaryLeft}>
                        <View
                          style={{
                            ...styles.accountTypeIndicator,
                            backgroundColor: "#377AF2",
                            width: 10,
                            height: 10,
                          }}
                        />
                        <PaperText style={styles.interestSummaryLabel}>
                          {type}
                        </PaperText>
                      </View>
                      <View style={styles.interestValueBadge}>
                        <PaperText style={styles.interestSummaryValue}>
                          +{interest.toFixed(2)} €
                        </PaperText>
                      </View>
                    </View>
                  );
                }
              )}
            </View>

            <View style={styles.interestSummaryTotal}>
              <PaperText style={styles.interestSummaryTotalLabel}>
                Total des intérêts
              </PaperText>
              <View style={styles.totalInterestValueBadge}>
                <PaperText style={styles.interestSummaryTotalValue}>
                  +
                  {Object.values(interestSimulation.totalInterestsByType)
                    .reduce((sum, val) => sum + val, 0)
                    .toFixed(2)}{" "}
                  €
                </PaperText>
              </View>
            </View>
          </View>
        </View>
      )}

      {(!showInterestSimulation || totalSavings === 0) && (
        <View style={styles.emptyChartContainer}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#ccc" />
          <PaperText style={styles.emptyStateText}>
            {totalSavings === 0
              ? "Ajoutez une épargne pour voir la simulation"
              : "Appuyez sur l'icône pour afficher la simulation"}
          </PaperText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartCardContent: {
    padding: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#377AF2",
  },
  chartContainer: {
    marginTop: 16,
  },
  simulationGraphicContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#377AF2",
    marginTop: 8,
  },
  projectionTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  projectionTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  projectionTabActive: {
    backgroundColor: "#377AF2",
  },
  projectionTabText: {
    fontSize: 14,
    color: "#666",
  },
  projectionTabTextActive: {
    color: "#fff",
  },
  chartFooter: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  interestSummaryContainer: {
    marginTop: 12,
  },
  interestSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  interestSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#377AF2",
    marginLeft: 8,
  },
  interestSummaryContent: {
    paddingLeft: 16,
  },
  interestSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  interestSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountTypeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  interestSummaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  interestValueBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  interestSummaryValue: {
    fontSize: 14,
    color: "#377AF2",
    fontWeight: "bold",
  },
  interestSummaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  interestSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  totalInterestValueBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  interestSummaryTotalValue: {
    fontSize: 16,
    color: "#377AF2",
    fontWeight: "bold",
  },
  emptyChartContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});

export default InterestSimulation;
