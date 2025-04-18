import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  TextInput as RNTextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import {
  Text as PaperText,
  Surface,
  useTheme,
  IconButton,
  Button,
  RadioButton,
  Menu,
  Portal,
} from "react-native-paper";
import StatCard from "../components/StatCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { RESPONSIVE, SPACING } from "../constants/dimensions";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type Period = "monthly" | "yearly";
type SavingsAccountType =
  | "livretA"
  | "ldds"
  | "lep"
  | "livretJeune"
  | "cel"
  | "pel"
  | "livretEpargneBancaire"
  | "compteATerme";

interface SavingsEntry {
  id: string; // Ajouter un ID unique pour chaque entrée
  amount: number;
  date: string;
  accountType: SavingsAccountType;
}

const SAVINGS_RATES = {
  livretA: 3, // Taux du Livret A (plafond : 22 950€)
  ldds: 3, // Livret de Développement Durable et Solidaire (plafond : 12 000€)
  lep: 4.1, // Livret d'Épargne Populaire (plafond : 7 700€)
  livretJeune: 2.5, // Livret Jeune (plafond : 1 600€, 12-25 ans)
  cel: 1.25, // Compte Épargne Logement
  pel: 2, // Plan d'Épargne Logement (plafond : 61 200€)
  livretEpargneBancaire: 1.5, // Livret d'épargne bancaire (taux moyen)
  compteATerme: 2.5, // Compte à terme (taux moyen)
};

const ACCOUNT_LABELS = {
  livretA: "Livret A",
  ldds: "LDDS",
  lep: "LEP",
  livretJeune: "Livret Jeune",
  cel: "CEL",
  pel: "PEL",
  livretEpargneBancaire: "Livret d'épargne bancaire",
  compteATerme: "Compte à terme",
};

const ACCOUNT_DETAILS = {
  livretA: "Plafond : 22 950€",
  ldds: "Plafond : 12 000€, développement durable et solidaire",
  lep: "Plafond : 7 700€, sous conditions de ressources",
  livretJeune: "Plafond : 1 600€, 12-25 ans",
  cel: "Plafond : 15 300€, épargne logement",
  pel: "Plafond : 61 200€, épargne logement",
  livretEpargneBancaire: "Livret bancaire sans plafond",
  compteATerme: "Blocage des fonds sur une période définie",
};

const EpargneScreen: React.FC = () => {
  const theme = useTheme();
  const [amount, setAmount] = useState("");
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");
  const [showMonthlyAmount, setShowMonthlyAmount] = useState(true);
  const [showYearlyAmount, setShowYearlyAmount] = useState(true);
  const [selectedAccountType, setSelectedAccountType] =
    useState<SavingsAccountType>("livretA");
  const [showInterestSimulation, setShowInterestSimulation] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [annualInterest, setAnnualInterest] = useState(0);
  const [projectionYears, setProjectionYears] = useState<1 | 5 | 10>(5);

  // Fermer le menu déroulant quand on clique ailleurs
  useEffect(() => {
    const handleOutsideClick = () => {
      if (menuVisible) {
        setMenuVisible(false);
      }
    };

    // Ajouter un écouteur d'événement pour les clics sur l'écran
    if (menuVisible) {
      setTimeout(() => {
        const subscription = Dimensions.addEventListener(
          "change",
          handleOutsideClick
        );
        return () => subscription.remove();
      }, 100);
    }

    return () => {};
  }, [menuVisible]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSavingsData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSavingsData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("savingsEntries");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Assurer que chaque entrée a un ID unique
        const entriesWithIds = parsedData.map((entry: SavingsEntry) => {
          if (!entry.id) {
            return {
              ...entry,
              id:
                Date.now().toString() +
                Math.random().toString(36).substring(2, 9),
            };
          }
          return entry;
        });
        setSavingsEntries(entriesWithIds);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données d'épargne:", error);
    }
  };

  const saveSavingsData = async (entries: SavingsEntry[]) => {
    try {
      await AsyncStorage.setItem("savingsEntries", JSON.stringify(entries));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des données d'épargne:",
        error
      );
    }
  };

  const handleAddSavings = () => {
    if (amount) {
      const amountValue = parseFloat(amount.replace(",", "."));
      if (!isNaN(amountValue) && amountValue > 0) {
        const newEntry: SavingsEntry = {
          id: Date.now().toString(), // Ajouter un ID unique pour chaque entrée
          amount: amountValue,
          date: new Date().toISOString(),
          accountType: selectedAccountType,
        };

        const updatedEntries = [...savingsEntries, newEntry];
        setSavingsEntries(updatedEntries);
        saveSavingsData(updatedEntries);
        setAmount("");
      }
    }
  };

  // Fonction pour supprimer une épargne
  const handleDeleteSavings = (id: string) => {
    const updatedEntries = savingsEntries.filter((entry) => entry.id !== id);
    setSavingsEntries(updatedEntries);
    saveSavingsData(updatedEntries);
  };
  const getAccountTypeColor = (accountType: SavingsAccountType) => {
    switch (accountType) {
      case "livretA":
        return "#377AF2"; // Bleu
      case "ldds":
        return "#37F2A8"; // Vert
      case "lep":
        return "#F23737"; // Rouge vif
      case "livretJeune":
        return "#F2B237"; // Orange
      case "cel":
        return "#9437F2"; // Violet
      case "pel":
        return "#F24B37"; // Rouge
      case "livretEpargneBancaire":
        return "#37B0F2"; // Bleu clair
      case "compteATerme":
        return "#7B37F2"; // Violet foncé
      default:
        return "#666666"; // Gris
    }
  };

  const totalSavings = useMemo(() => {
    return savingsEntries.reduce((total, entry) => total + entry.amount, 0);
  }, [savingsEntries]);

  const totalByAccountType = useMemo(() => {
    return savingsEntries.reduce((acc, entry) => {
      if (!acc[entry.accountType]) {
        acc[entry.accountType] = 0;
      }
      acc[entry.accountType] += entry.amount;
      return acc;
    }, {} as Record<SavingsAccountType, number>);
  }, [savingsEntries]);

  const monthlySavings = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    return savingsEntries
      .filter((entry) => new Date(entry.date) >= oneMonthAgo)
      .reduce((total, entry) => total + entry.amount, 0);
  }, [savingsEntries]);

  // Projection annuelle (montant mensuel × 12)
  const annualProjection = useMemo(() => {
    return monthlySavings * 12;
  }, [monthlySavings]);

  const yearlySavings = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return savingsEntries
      .filter((entry) => new Date(entry.date) >= oneYearAgo)
      .reduce((total, entry) => total + entry.amount, 0);
  }, [savingsEntries]);

  // Simulation des intérêts selon le type de compte
  const simulateInterest = (years: number) => {
    // Calculer le principal par type de compte
    const principalsByType: Record<SavingsAccountType, number> =
      totalByAccountType;

    // Créer un objet pour suivre les intérêts par type de compte
    const interestsByType: Record<SavingsAccountType, number[]> = {} as Record<
      SavingsAccountType,
      number[]
    >;
    Object.keys(principalsByType).forEach((type) => {
      if (principalsByType[type as SavingsAccountType] > 0) {
        interestsByType[type as SavingsAccountType] = [];
      }
    });

    // Résultats pour le montant total
    const results: Array<{ month: number; amount: number }> = [];

    // Résultats détaillés par type de compte
    const detailedResults: Record<
      string,
      Array<{ month: number; amount: number }>
    > = {};
    Object.keys(interestsByType).forEach((type) => {
      detailedResults[type] = [];
    });

    // Initialiser le total pour le premier point (mois 0)
    let totalAmount = Object.values(principalsByType).reduce(
      (sum, val) => sum + val,
      0
    );
    results.push({ month: 0, amount: totalAmount });

    // Initialiser les valeurs initiales pour chaque type de compte
    Object.entries(principalsByType).forEach(([type, amount]) => {
      if (amount > 0) {
        detailedResults[type].push({ month: 0, amount });
      }
    });

    // Pour chaque mois, calculer les intérêts pour chaque type de compte
    for (let i = 1; i <= years * 12; i++) {
      // Pour chaque type de compte, appliquer son taux d'intérêt
      Object.entries(principalsByType).forEach(([type, amount]) => {
        if (amount > 0) {
          const accountType = type as SavingsAccountType;
          const rate = SAVINGS_RATES[accountType];
          const monthlyRate = rate / 100 / 12;

          // Calculer les intérêts pour ce mois
          const interest = amount * monthlyRate;
          interestsByType[accountType].push(interest);

          // Mettre à jour le principal avec les intérêts
          principalsByType[accountType] = amount + interest;

          // Ajouter un point de données tous les 6 mois pour le graphique détaillé
          if (i % 6 === 0) {
            detailedResults[type].push({
              month: i,
              amount: principalsByType[accountType],
            });
          }
        }
      });

      // Calculer le nouveau total
      totalAmount = Object.values(principalsByType).reduce(
        (sum, val) => sum + val,
        0
      );

      // Ajouter un point de données tous les 6 mois pour le graphique principal
      if (i % 6 === 0) {
        results.push({
          month: i,
          amount: totalAmount,
        });
      }
    }

    // Calculer le total des intérêts pour chaque type de compte
    const totalInterestsByType: Record<SavingsAccountType, number> =
      {} as Record<SavingsAccountType, number>;
    Object.entries(interestsByType).forEach(([type, interests]) => {
      totalInterestsByType[type as SavingsAccountType] = interests.reduce(
        (sum, val) => sum + val,
        0
      );
    });

    return {
      totalSimulation: results,
      detailedSimulation: detailedResults,
      totalInterestsByType,
    };
  };

  const interestSimulation = useMemo(() => {
    return simulateInterest(projectionYears); // Simulation sur la période sélectionnée
  }, [totalSavings, totalByAccountType, projectionYears]);

  const chartData = useMemo(() => {
    const { totalSimulation } = interestSimulation;

    return {
      labels: totalSimulation.map((point) => `${point.month}m`),
      datasets: [
        {
          data: totalSimulation.map((point) => point.amount),
          color: (opacity = 1) => `rgba(55, 122, 242, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Épargne totale"],
    };
  }, [interestSimulation]);

  // Données pour le graphique détaillé par type de compte
  const detailedChartData = useMemo(() => {
    const { detailedSimulation } = interestSimulation;
    const datasets: Array<{
      data: number[];
      color: (opacity: number) => string;
      strokeWidth: number;
    }> = [];
    const labels: string[] = [];
    const legend: string[] = [];

    // Trouver tous les mois uniques pour les étiquettes
    Object.values(detailedSimulation).forEach((simulation) => {
      simulation.forEach((point) => {
        if (!labels.includes(`${point.month}m`)) {
          labels.push(`${point.month}m`);
        }
      });
    });

    // Trier les étiquettes numériquement
    labels.sort((a, b) => parseInt(a) - parseInt(b));

    // Créer un dataset pour chaque type de compte
    Object.entries(detailedSimulation).forEach(([type, simulation]) => {
      if (simulation.length > 0) {
        const accountType = type as SavingsAccountType;
        datasets.push({
          data: simulation.map((point) => point.amount),
          color: (opacity = 1) =>
            `${getAccountTypeColor(accountType)}${Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
          strokeWidth: 2,
        });
        legend.push(ACCOUNT_LABELS[accountType]);
      }
    });

    return {
      labels,
      datasets,
      legend,
    };
  }, [interestSimulation]);

  const renderStatCard = (
    title: string,
    value: string,
    icon: IconName,
    period: Period
  ) => {
    const isMonthly = period === "monthly";
    const showAmount = isMonthly ? showMonthlyAmount : showYearlyAmount;
    const setShowAmount = isMonthly
      ? setShowMonthlyAmount
      : setShowYearlyAmount;

    return (
      <StatCard
        title={title}
        value={value}
        icon={icon}
        hideValue={!showAmount}
        onPress={() => {
          setSelectedPeriod(period);
          setShowAmount(!showAmount);
        }}
      />
    );
  };

  // Créer un portail pour la liste déroulante afin qu'elle s'affiche au-dessus de tout
  const renderDropdown = () => {
    if (!menuVisible) return null;

    return (
      <View style={styles.dropdownOverlay}>
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
        <View
          style={[
            styles.dropdownContainer,
            {
              top: dropdownPosition.y,
              left: dropdownPosition.x,
              width: dropdownPosition.width,
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScrollView}
            nestedScrollEnabled={true}
          >
            {Object.entries(ACCOUNT_LABELS).map(([key, label]) => {
              const accountType = key as SavingsAccountType;
              const isSelected = selectedAccountType === accountType;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.dropdownItem,
                    isSelected && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedAccountType(accountType);
                    calculateAnnualInterest(amount, accountType);
                    setMenuVisible(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.dropdownItemLeft}>
                      <View
                        style={[
                          styles.accountTypeIndicator,
                          { backgroundColor: getAccountTypeColor(accountType) },
                        ]}
                      />
                      <View style={styles.dropdownItemTextContainer}>
                        <PaperText style={styles.dropdownItemLabel}>
                          {label}
                        </PaperText>
                        <PaperText style={styles.dropdownItemDetail}>
                          {ACCOUNT_DETAILS[accountType]}
                        </PaperText>
                      </View>
                    </View>
                    <View style={styles.dropdownItemRight}>
                      <View style={styles.rateContainer}>
                        <PaperText style={styles.rateText}>
                          {SAVINGS_RATES[accountType] > 0
                            ? `${SAVINGS_RATES[accountType]}%`
                            : "-"}
                        </PaperText>
                      </View>
                      {isSelected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={getAccountTypeColor(accountType)}
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Référence pour mesurer la position du sélecteur
  const selectorRef = React.useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
  });

  // Mettre à jour la position de la liste déroulante
  const updateDropdownPosition = () => {
    if (selectorRef.current) {
      selectorRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height + 2,
          width: width,
        });
      });
    }
  };

  const handleOpenDropdown = () => {
    updateDropdownPosition();
    setMenuVisible(true);
  };

  // Calculer les intérêts annuels en fonction du montant et du taux d'intérêt
  const calculateAnnualInterest = (
    amountStr: string,
    accountType: SavingsAccountType
  ) => {
    const amountValue = parseFloat(amountStr.replace(",", "."));
    if (!isNaN(amountValue) && amountValue > 0) {
      const rate = SAVINGS_RATES[accountType];
      const interest = amountValue * (rate / 100);
      setAnnualInterest(interest);
    } else {
      setAnnualInterest(0);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <PaperText style={styles.title}>Épargne</PaperText>
            </View>

            <View style={styles.statsContainer}>
              {renderStatCard(
                "Mensuel",
                `${monthlySavings.toFixed(2)} €`,
                "calendar-month",
                "monthly"
              )}
              {renderStatCard(
                "Annuel",
                `${annualProjection.toFixed(2)} €`,
                "calendar",
                "yearly"
              )}
            </View>

            <Surface style={styles.inputCard}>
              <View style={styles.inputCardContent}>
                <PaperText style={styles.inputTitle}>
                  Ajouter une épargne
                </PaperText>
                <View style={styles.accountTypeContainer}>
                  <PaperText style={styles.accountTypeLabel}>
                    Type de livret :
                  </PaperText>
                  <View ref={selectorRef} collapsable={false}>
                    <TouchableOpacity
                      style={styles.accountTypeSelector}
                      onPress={handleOpenDropdown}
                    >
                      <View style={styles.selectedAccountInfo}>
                        <View
                          style={[
                            styles.accountTypeIndicator,
                            {
                              backgroundColor:
                                getAccountTypeColor(selectedAccountType),
                            },
                          ]}
                        />
                        <View style={styles.selectedAccountTextContainer}>
                          <PaperText style={styles.accountTypeText}>
                            {ACCOUNT_LABELS[selectedAccountType]}
                          </PaperText>
                          <View style={styles.accountDetailsRow}>
                            <PaperText style={styles.selectedAccountDetail}>
                              {ACCOUNT_DETAILS[selectedAccountType]}
                            </PaperText>
                            <PaperText style={styles.interestRateText}>
                              {SAVINGS_RATES[selectedAccountType]}%
                            </PaperText>
                          </View>
                        </View>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <RNTextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      calculateAnnualInterest(text, selectedAccountType);
                    }}
                    placeholder="Montant"
                    keyboardType="numeric"
                  />
                  <Button
                    mode="contained"
                    onPress={handleAddSavings}
                    style={styles.addButton}
                  >
                    Ajouter
                  </Button>
                </View>
                {/* Nous avons déplacé l'affichage des intérêts dans la carte Annuel */}
              </View>
            </Surface>

            <Surface style={styles.chartCard}>
              <View style={styles.chartCardContent}>
                <View style={styles.chartHeader}>
                  <PaperText style={styles.chartTitle}>
                    Simulation des intérêts
                  </PaperText>
                  <IconButton
                    icon={showInterestSimulation ? "eye" : "eye-off"}
                    size={24}
                    onPress={() =>
                      setShowInterestSimulation(!showInterestSimulation)
                    }
                  />
                </View>
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
                            ? {
                                ...styles.projectionTab,
                                ...styles.projectionTabActive,
                              }
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
                            ? {
                                ...styles.projectionTab,
                                ...styles.projectionTabActive,
                              }
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
                            ? {
                                ...styles.projectionTab,
                                ...styles.projectionTabActive,
                              }
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
                      {projectionYears === 1 ? "an" : "ans"} selon les taux de
                      chaque livret
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
                        {Object.entries(interestSimulation.totalInterestsByType)
                          .map(([type, interest]) => {
                            const accountType = type as SavingsAccountType;
                            if (totalByAccountType[accountType] > 0) {
                              return (
                                <View
                                  key={`interest-summary-${type}`}
                                  style={styles.interestSummaryRow}
                                >
                                  <View style={styles.interestSummaryLeft}>
                                    <View
                                      style={{
                                        ...styles.accountTypeIndicator,
                                        backgroundColor:
                                          getAccountTypeColor(accountType),
                                        width: 10,
                                        height: 10,
                                      }}
                                    />
                                    <PaperText
                                      style={styles.interestSummaryLabel}
                                    >
                                      {ACCOUNT_LABELS[accountType]}
                                    </PaperText>
                                  </View>
                                  <View style={styles.interestValueBadge}>
                                    <PaperText
                                      style={styles.interestSummaryValue}
                                    >
                                      +{interest.toFixed(2)} €
                                    </PaperText>
                                  </View>
                                </View>
                              );
                            }
                            return null;
                          })
                          .filter((item) => item !== null)}
                      </View>

                      <View style={styles.interestSummaryTotal}>
                        <PaperText style={styles.interestSummaryTotalLabel}>
                          Total des intérêts
                        </PaperText>
                        <View style={styles.totalInterestValueBadge}>
                          <PaperText style={styles.interestSummaryTotalValue}>
                            +
                            {Object.values(
                              interestSimulation.totalInterestsByType
                            )
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
                    <MaterialCommunityIcons
                      name="chart-line"
                      size={48}
                      color="#ccc"
                    />
                    <PaperText style={styles.emptyStateText}>
                      {totalSavings === 0
                        ? "Ajoutez une épargne pour voir la simulation"
                        : "Appuyez sur l'icône pour afficher la simulation"}
                    </PaperText>
                  </View>
                )}
              </View>
            </Surface>

            <Surface style={styles.historyCard}>
              <View style={styles.historyCardContent}>
                <PaperText style={styles.historyTitle}>Historique</PaperText>

                {savingsEntries.length > 0 ? (
                  savingsEntries
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <View key={entry.id} style={styles.historyItem}>
                        <View style={styles.historyItemHeader}>
                          <MaterialCommunityIcons
                            name="cash-plus"
                            size={20}
                            color="#377AF2"
                          />
                          <PaperText style={styles.historyItemDate}>
                            {new Date(entry.date).toLocaleDateString("fr-FR")}
                          </PaperText>
                          <View
                            style={{
                              ...styles.accountTypeTag,
                              backgroundColor:
                                getAccountTypeColor(entry.accountType) + "20",
                            }}
                          >
                            <PaperText
                              style={{
                                ...styles.accountTypeTagText,
                                color: getAccountTypeColor(entry.accountType),
                              }}
                            >
                              {ACCOUNT_LABELS[entry.accountType]}
                            </PaperText>
                          </View>
                        </View>
                        <View style={styles.historyItemRight}>
                          <PaperText style={styles.historyItemAmount}>
                            +{entry.amount.toFixed(2)} €
                          </PaperText>
                          <TouchableOpacity
                            onPress={() => handleDeleteSavings(entry.id)}
                            style={styles.deleteButton}
                          >
                            <MaterialCommunityIcons
                              name="delete-outline"
                              size={20}
                              color="#F23737"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <MaterialCommunityIcons
                      name="history"
                      size={48}
                      color="#ccc"
                    />
                    <PaperText style={styles.emptyStateText}>
                      Aucune épargne enregistrée
                    </PaperText>
                  </View>
                )}
              </View>
            </Surface>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
      {renderDropdown()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom:
      RESPONSIVE.tabBarHeight + RESPONSIVE.bottomSafeArea + SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#377AF2",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  interestInfoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  interestInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  interestInfoLabel: {
    fontSize: 12,
    color: "#666",
  },
  interestInfoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#377AF2",
  },
  interestInfoTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#377AF2",
  },
  inputCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  inputCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountTypeContainer: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
  accountTypeLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  accountTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  selectedAccountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedAccountTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedAccountDetail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    flex: 1,
  },
  accountDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  interestRateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#377AF2",
    backgroundColor: "rgba(55, 122, 242, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  interestPreviewContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(55, 122, 242, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(55, 122, 242, 0.2)",
    borderRadius: 12,
  },
  interestPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interestPreviewLabel: {
    fontSize: 14,
    color: "#666",
  },
  interestPreviewValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#377AF2",
  },
  interestPreviewValueTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#377AF2",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 10,
    pointerEvents: "box-none",
  },
  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(55, 122, 242, 0.05)",
  },
  dropdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownItemDetail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dropdownItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateContainer: {
    marginLeft: 8,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  checkIcon: {
    marginLeft: 8,
  },
  accountTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#377AF2",
    height: 50,
    justifyContent: "center",
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  chartCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  simulationGraphicContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#377AF2",
    marginTop: 8,
  },
  chartFooter: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginTop: 8,
    marginBottom: 8,
  },

  projectionTabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    alignSelf: "center",
  },
  projectionTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
  },
  projectionTabActive: {
    backgroundColor: "#377AF2",
  },
  projectionTabText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  projectionTabTextActive: {
    color: "white",
  },
  interestSummaryContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8faff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interestSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  interestSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  interestSummaryContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statValueContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenValueContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  interestSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 4,
  },
  interestSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  interestSummaryLabel: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
    fontWeight: "500",
  },
  interestValueBadge: {
    backgroundColor: "rgba(55, 242, 168, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  interestSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00B37E",
  },
  interestSummaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  interestSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalInterestValueBadge: {
    backgroundColor: "rgba(55, 242, 168, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  interestSummaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00B37E",
  },
  emptyChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  historyCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  historyCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyItemDate: {
    fontSize: 16,
    marginLeft: 12,
  },
  accountTypeTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountTypeTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  historyItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#37F2A8",
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
});

export default EpargneScreen;
