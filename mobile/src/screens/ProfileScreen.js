import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';

import { DEMO_ADDRESS } from '../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showRecharge, setShowRecharge] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMint, setShowMint] = useState(false);

  // Form States
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferNftAddr, setTransferNftAddr] = useState('');

  const [mintTo, setMintTo] = useState(DEMO_ADDRESS);
  const [mintTokenId, setMintTokenId] = useState('');
  const [mintOrigin, setMintOrigin] = useState('Yunnan');
  const [mintNftAddr, setMintNftAddr] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchDefaultAddress();
  }, []);

  const fetchDefaultAddress = async () => {
    try {
      const res = await apiClient.get('/nft/default-address');
      if (res.ok && res.address) {
        setTransferNftAddr(res.address);
        setMintNftAddr(res.address);
      }
    } catch (e) {
      console.log('Failed to fetch default address');
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await apiClient.get(`/balance/${DEMO_ADDRESS}`);
      if (res && res.balance !== undefined) {
        setBalance(res.balance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecharge = async (paymentMethod) => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      Alert.alert('错误 Error', '请输入有效金额 Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await apiClient.post('/topup', {
        address: DEMO_ADDRESS,
        rmb: Number(rechargeAmount),
        payment_method: paymentMethod
      });

      if (res.ok) {
        setShowRecharge(false);
        setRechargeAmount('');
        setBalance(res.balance);

        // Show success message after modal closes
        setTimeout(() => {
          const methodName = paymentMethod === 'alipay' ? '支付宝 Alipay' : '微信支付 WeChat Pay';
          Alert.alert(
            '充值成功 Success!',
            `已通过 ${methodName} 充值 ¥${rechargeAmount}\n\nRecharged ¥${rechargeAmount} via ${methodName}\n\n当前余额 Current Balance: ¥${res.balance}`
          );
        }, 300);
      } else {
        Alert.alert('Error', res.error || 'Recharge failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferNFT = async () => {
    if (!transferTo || !transferTokenId || !transferNftAddr) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/relay/nft/transfer', {
        from: DEMO_ADDRESS,
        to: transferTo,
        tokenId: Number(transferTokenId),
        nftAddress: transferNftAddr
      });
      if (res.ok) {
        Alert.alert('Success', `NFT #${transferTokenId} transferred!`);
        setShowTransfer(false);
        fetchBalance(); // Balance might change due to fees (if any logic added later)
      } else {
        Alert.alert('Error', res.error || 'Transfer failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!mintTokenId || !mintOrigin || !mintNftAddr) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/relay/nft/mint', {
        from: DEMO_ADDRESS,
        to: mintTo,
        tokenId: Number(mintTokenId),
        nftAddress: mintNftAddr,
        origin: mintOrigin,
        harvestTime: Math.floor(Date.now() / 1000),
        inspectionId: 'QC-' + Date.now()
      });
      if (res.ok) {
        Alert.alert('Success', `NFT #${mintTokenId} minted!`);
        setShowMint(false);
        fetchBalance();
      } else {
        Alert.alert('Error', res.error || 'Mint failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View>
              <Text style={styles.userName}>Farmer John</Text>
              <Text style={styles.userId}>ID: {DEMO_ADDRESS.substring(0, 6)}...</Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('profile.totalBalance')}</Text>
          <Text style={styles.balanceValue}>¥{balance}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowRecharge(true)}>
              <Ionicons name="wallet-outline" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>{t('profile.recharge')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTransfer(true)}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>Transfer NFT</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyAssets')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="briefcase-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>My Assets & Transactions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setShowMint(true)}>
            <View style={styles.menuLeft}>
              <Ionicons name="add-circle-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>Mint New NFT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
            <View style={styles.menuLeft}>
              <Ionicons name="language-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>{t('profile.language')}</Text>
            </View>
            <View style={styles.languageIndicator}>
              <Text style={styles.currentLang}>{i18n.language === 'zh' ? '中文' : 'English'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recharge Modal */}
        <Modal visible={showRecharge} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>充值 Recharge</Text>

              {/* Amount Input */}
              <TextInput
                style={styles.input}
                placeholder="输入充值金额 Enter Amount"
                keyboardType="numeric"
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
              />

              {/* Quick Amount Selection */}
              <View style={styles.quickAmounts}>
                {[100, 500, 1000, 5000].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountBtn}
                    onPress={() => setRechargeAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>¥{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Method Selection */}
              <Text style={styles.paymentMethodTitle}>选择支付方式 Payment Method</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={styles.paymentMethodBtn}
                  onPress={() => handleRecharge('alipay')}
                  disabled={loading}
                >
                  <View style={[styles.paymentIcon, { backgroundColor: '#1677FF' }]}>
                    <Ionicons name="logo-alipay" size={32} color="#fff" />
                  </View>
                  <Text style={styles.paymentMethodText}>支付宝</Text>
                  <Text style={styles.paymentMethodSubtext}>Alipay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.paymentMethodBtn}
                  onPress={() => handleRecharge('wechat')}
                  disabled={loading}
                >
                  <View style={[styles.paymentIcon, { backgroundColor: '#07C160' }]}>
                    <Ionicons name="logo-wechat" size={32} color="#fff" />
                  </View>
                  <Text style={styles.paymentMethodText}>微信支付</Text>
                  <Text style={styles.paymentMethodSubtext}>WeChat Pay</Text>
                </TouchableOpacity>
              </View>

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#d81e06" />
                  <Text style={styles.loadingText}>Processing payment...</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { marginTop: 16 }]}
                onPress={() => setShowRecharge(false)}
              >
                <Text style={styles.cancelBtnText}>取消 Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Transfer NFT Modal */}
        <Modal visible={showTransfer} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Transfer NFT</Text>
              <TextInput
                style={styles.input}
                placeholder="To Address"
                value={transferTo}
                onChangeText={setTransferTo}
              />
              <TextInput
                style={styles.input}
                placeholder="Token ID"
                keyboardType="numeric"
                value={transferTokenId}
                onChangeText={setTransferTokenId}
              />
              <TextInput
                style={styles.input}
                placeholder="NFT Contract Address"
                value={transferNftAddr}
                onChangeText={setTransferNftAddr}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowTransfer(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleTransferNFT}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Transfer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Mint NFT Modal */}
        <Modal visible={showMint} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mint NFT</Text>
              <TextInput
                style={styles.input}
                placeholder="Token ID"
                keyboardType="numeric"
                value={mintTokenId}
                onChangeText={setMintTokenId}
              />
              <TextInput
                style={styles.input}
                placeholder="Origin"
                value={mintOrigin}
                onChangeText={setMintOrigin}
              />
              <TextInput
                style={styles.input}
                placeholder="NFT Contract Address"
                value={mintNftAddr}
                onChangeText={setMintNftAddr}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowMint(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleMintNFT}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Mint</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#d81e06',
    padding: 20,
    paddingBottom: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userId: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: -30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#d81e06',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  menuSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLang: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  confirmBtn: {
    backgroundColor: '#d81e06',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Payment Method Styles
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d81e06',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#d81e06',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  paymentMethodBtn: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    width: '45%',
  },
  paymentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  paymentMethodSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  loadingOverlay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;
