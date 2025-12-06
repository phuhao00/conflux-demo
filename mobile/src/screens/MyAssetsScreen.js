import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { DEMO_ADDRESS } from '../utils/constants';

const MyAssetsScreen = () => {
    const [assets, setAssets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('assets'); // 'assets' or 'transactions'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadAssets(), loadTransactions()]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadAssets = async () => {
        try {
            const res = await apiClient.get(`/assets/${DEMO_ADDRESS}`);
            if (res.ok && res.data) {
                setAssets(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadTransactions = async () => {
        try {
            const res = await apiClient.get(`/transactions/${DEMO_ADDRESS}`);
            if (res.ok && res.data) {
                setTransactions(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getIconComponent = (iconName) => {
        const icons = {
            'leaf': <Ionicons name="leaf" size={32} color="#4CAF50" />,
            'water': <Ionicons name="water" size={32} color="#2196F3" />,
            'sunny': <Ionicons name="sunny" size={32} color="#FF9800" />,
            'nutrition': <Ionicons name="nutrition" size={32} color="#8BC34A" />,
        };
        return icons[iconName] || <Ionicons name="cube" size={32} color="#9E9E9E" />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'matured': return '#2196F3';
            case 'sold': return '#9E9E9E';
            default: return '#666';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'investment': return '#4CAF50';
            case 'deposit': return '#2196F3';
            case 'withdrawal': return '#FF9800';
            case 'yieldPayout': return '#9C27B0';
            default: return '#666';
        }
    };

    const renderAsset = ({ item }) => (
        <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
                <View style={styles.iconContainer}>
                    {getIconComponent(item.product_icon)}
                </View>
                <View style={styles.assetInfo}>
                    <Text style={styles.assetName}>{item.product_name}</Text>
                    <Text style={styles.assetDate}>Purchased: {item.purchase_date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.assetDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Investment:</Text>
                    <Text style={styles.detailValue}>¥{item.investment_amount}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Yield Rate:</Text>
                    <Text style={[styles.detailValue, styles.yieldValue]}>{item.yield_rate}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Token ID:</Text>
                    <Text style={styles.detailValueSmall}>{item.token_id}</Text>
                </View>
            </View>

            {item.tx_hash && (
                <TouchableOpacity style={styles.txHashContainer}>
                    <Ionicons name="link" size={14} color="#666" />
                    <Text style={styles.txHash} numberOfLines={1}>
                        {item.tx_hash.substring(0, 20)}...
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderTransaction = ({ item }) => {
        const getPaymentMethodIcon = (method) => {
            if (method === 'alipay') return 'logo-alipay';
            if (method === 'wechat') return 'logo-wechat';
            return 'card-outline';
        };

        const getPaymentMethodColor = (method) => {
            if (method === 'alipay') return '#1677FF';
            if (method === 'wechat') return '#07C160';
            return '#666';
        };

        return (
            <View style={styles.transactionCard}>
                <View style={styles.txHeader}>
                    <View style={[styles.txTypeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                        <Ionicons
                            name={item.type === 'investment' ? 'trending-up' : item.type === 'deposit' ? 'arrow-down' : 'arrow-up'}
                            size={20}
                            color={getTypeColor(item.type)}
                        />
                    </View>
                    <View style={styles.txInfo}>
                        <Text style={styles.txType}>{item.type}</Text>
                        <Text style={styles.txDate}>{item.created_at}</Text>
                        {item.payment_method && (
                            <View style={styles.paymentMethodBadge}>
                                <Ionicons
                                    name={getPaymentMethodIcon(item.payment_method)}
                                    size={12}
                                    color={getPaymentMethodColor(item.payment_method)}
                                />
                                <Text style={[styles.paymentMethodText, { color: getPaymentMethodColor(item.payment_method) }]}>
                                    {item.payment_method === 'alipay' ? '支付宝' : item.payment_method === 'wechat' ? '微信' : item.payment_method}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.txAmount}>
                        <Text style={[styles.txAmountText, { color: getTypeColor(item.type) }]}>
                            {item.type === 'withdrawal' ? '-' : '+'}¥{item.amount}
                        </Text>
                        <View style={[styles.txStatus, { backgroundColor: item.status === 'success' ? '#4CAF50' : '#FF9800' }]}>
                            <Text style={styles.txStatusText}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Portfolio</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'assets' && styles.activeTab]}
                    onPress={() => setActiveTab('assets')}
                >
                    <Ionicons name="briefcase" size={20} color={activeTab === 'assets' ? '#d81e06' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'assets' && styles.activeTabText]}>
                        Assets ({assets.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <Ionicons name="list" size={20} color={activeTab === 'transactions' ? '#d81e06' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
                        Transactions ({transactions.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#d81e06" />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'assets' ? assets : transactions}
                    renderItem={activeTab === 'assets' ? renderAsset : renderTransaction}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d81e06']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={activeTab === 'assets' ? 'briefcase-outline' : 'list-outline'}
                                size={64}
                                color="#ccc"
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === 'assets' ? 'No assets yet' : 'No transactions yet'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'assets' ? 'Start investing in products!' : 'Your transaction history will appear here'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#d81e06',
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#d81e06',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    // Asset Card Styles
    assetCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    assetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    assetInfo: {
        flex: 1,
    },
    assetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    assetDate: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    assetDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    yieldValue: {
        color: '#4CAF50',
    },
    detailValueSmall: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    txHashContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    txHash: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
        fontFamily: 'monospace',
        flex: 1,
    },
    // Transaction Card Styles
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    txHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    txTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
    },
    txType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
        marginBottom: 4,
    },
    txDate: {
        fontSize: 12,
        color: '#999',
    },
    txAmount: {
        alignItems: 'flex-end',
    },
    txAmountText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    txStatus: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    txStatusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    paymentMethodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    paymentMethodText: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '500',
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default MyAssetsScreen;
