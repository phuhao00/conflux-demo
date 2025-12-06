
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../api/client';

const MarketScreen = () => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/market');
      if (res.ok && res.data) {
        setMarketData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const iconProps = { size: 32, color: '#666' };
    return <MaterialCommunityIcons name={iconName || 'help-circle'} {...iconProps} />;
  };

  const renderItem = ({ item }) => {
    const isPositive = item.change_val && item.change_val.startsWith('+');
    const color = isPositive ? '#d81e06' : '#19be6b'; // Red for up, Green for down

    return (
      <TouchableOpacity style={styles.row}>
        <View style={styles.nameCol}>
          <View style={styles.iconContainer}>
            {getIcon(item.icon)}
          </View>
          <View>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.subText}>Spot Price</Text>
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={[styles.priceText, { color }]}>${item.price}</Text>
          <Text style={styles.changeText}>{item.change_val}</Text>
        </View>
        <View style={styles.changeCol}>
          <View style={[styles.changeBadge, { backgroundColor: color }]}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color="#fff"
              style={styles.trendIcon}
            />
            <Text style={styles.changePercentText}>{item.change_percent}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('market.title')}</Text>
          <Text style={styles.headerSubtitle}>Real-time Commodity Prices</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="refresh" size={24} color="#d81e06" />
        </TouchableOpacity>
      </View>

      <View style={styles.marketSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="arrow-up" size={20} color="#d81e06" />
          <Text style={styles.summaryValue}>4</Text>
          <Text style={styles.summaryLabel}>Rising</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="arrow-down" size={20} color="#19be6b" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Falling</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="time" size={20} color="#999" />
          <Text style={styles.summaryValue}>Live</Text>
          <Text style={styles.summaryLabel}>Updated</Text>
        </View>
      </View>

      <View style={styles.columnHeaders}>
        <Text style={[styles.headerText, styles.nameCol]}>{t('market.product')}</Text>
        <Text style={[styles.headerText, styles.priceCol]}>{t('market.price')}</Text>
        <Text style={[styles.headerText, styles.changeCol]}>{t('market.change')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d81e06" />
        </View>
      ) : (
        <FlatList
          data={marketData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  marketSummary: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  nameCol: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priceCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  changeCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  subText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  trendIcon: {
    marginRight: 4,
  },
  changePercentText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default MarketScreen;
