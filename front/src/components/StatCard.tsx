import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text as PaperText, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatCardProps {
  title: string;
  value: string;
  icon: IconName;
  onPress?: () => void;
  hideValue?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  onPress, 
  hideValue = false 
}) => {
  const theme = useTheme();

  const cardContent = (
    <Surface style={styles.statCard} elevation={3}>
      <View style={styles.statCardContent}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        {hideValue ? (
          <View style={styles.hiddenValueContainer}>
            <MaterialCommunityIcons name="eye-off" size={20} color="#666" />
          </View>
        ) : (
          <PaperText style={styles.statValue}>{value}</PaperText>
        )}
        <PaperText style={styles.statTitle}>{title}</PaperText>
      </View>
    </Surface>
  );

  if (onPress) {
    return (
      <View style={styles.touchableContainer} onTouchEnd={onPress}>
        {cardContent}
      </View>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  touchableContainer: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
  },
  statCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  hiddenValueContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default StatCard;
