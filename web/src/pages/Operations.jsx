import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useToast } from '../contexts/ToastContext';

const Operations = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Form States
    const [topupForm, setTopupForm] = useState({ address: '0xfB11f0cFE930B10696208d52e4AF121507B57B00', amount: '' });
    const [balanceAddress, setBalanceAddress] = useState('0xfB11f0cFE930B10696208d52e4AF121507B57B00');
    const [mintForm, setMintForm] = useState({
        from: '0xfB11f0cFE930B10696208d52e4AF121507B57B00',
        to: '0xfB11f0cFE930B10696208d52e4AF121507B57B00',
        nftAddress: '0x5D96E3BDC05Bc48D6bae1A38B0f6Bdf86C47e13d',
        tokenId: '',
        origin: '云南普洱',
        harvestTime: Math.floor(Date.now() / 1000),
        inspectionId: 'QC20240101',
        uri: ''
    });
    const [transferForm, setTransferForm] = useState({
        from: '',
        to: '',
        nftAddress: '',
        tokenId: ''
    });
    const [detailsForm, setDetailsForm] = useState({
        nftAddress: '',
        tokenId: ''
    });

    useEffect(() => {
        // Load default address
        const loadDefaultAddress = async () => {
            try {
                const res = await apiClient.get('/nft/default-address');
                if (res.ok && res.address) {
                    setMintForm(prev => ({ ...prev, nftAddress: res.address }));
                    setTransferForm(prev => ({ ...prev, nftAddress: res.address }));
                    setDetailsForm(prev => ({ ...prev, nftAddress: res.address }));
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadDefaultAddress();
    }, []);

    const handleApiCall = async (callFn, successMsg) => {
        setLoading(true);
        setResult(null);
        try {
            const data = await callFn();
            setResult({ success: true, data });
            if (successMsg) showToast('✅ Success', successMsg);
        } catch (error) {
            setResult({ success: false, error });
            showToast('❌ Error', error.message || 'Operation failed', false);
        } finally {
            setLoading(false);
        }
    };

    const topup = () => {
        if (!topupForm.address || !topupForm.amount) return showToast('Error', 'Please fill fields', false);
        handleApiCall(async () => {
            const res = await apiClient.post('/topup', { address: topupForm.address, rmb: parseFloat(topupForm.amount) });
            return res;
        }, 'Topup successful');
    };

    const getBalance = () => {
        if (!balanceAddress) return showToast('Error', 'Please fill address', false);
        handleApiCall(async () => {
            const res = await apiClient.get(`/balance/${balanceAddress}`);
            return res; // res is already data due to interceptor? No, interceptor returns res.data. 
            // My client.js returns response.data.
        }, 'Balance retrieved');
    };

    const mintNFT = () => {
        // Validation...
        handleApiCall(async () => {
            const payload = { ...mintForm, tokenId: parseInt(mintForm.tokenId), harvestTime: parseInt(mintForm.harvestTime) };
            const res = await apiClient.post('/relay/nft/mint', payload);
            return res;
        }, `Batch #${mintForm.tokenId} minted!`);
    };

    const transferNFT = () => {
        handleApiCall(async () => {
            const payload = { ...transferForm, tokenId: parseInt(transferForm.tokenId) };
            const res = await apiClient.post('/relay/nft/transfer', payload);
            return res;
        }, `Batch #${transferForm.tokenId} transferred!`);
    };

    const getBatchDetails = () => {
        handleApiCall(async () => {
            const res = await apiClient.get(`/nft/batch/${detailsForm.nftAddress}/${detailsForm.tokenId}/details`);
            return res;
        }, 'Details retrieved');
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-container">
                    <h1 className="page-title">我的操作</h1>
                    <p className="page-subtitle">管理您的企业账户和产品批次</p>
                </div>
            </div>

            <div className="main-container">
                {/* Topup */}
                <div className="action-panel" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                    <div className="panel-title" style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e8ecf1' }}>💰 充值服务费</div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>企业账户</label>
                            <input type="text" value={topupForm.address} onChange={e => setTopupForm({ ...topupForm, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>金额 (RMB)</label>
                            <input type="number" value={topupForm.amount} onChange={e => setTopupForm({ ...topupForm, amount: e.target.value })} placeholder="100" />
                        </div>
                    </div>
                    <button className="btn" style={{ padding: '12px 24px', background: '#7c8ff5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} onClick={topup}>充值</button>
                </div>

                {/* Balance */}
                <div className="action-panel" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                    <div className="panel-title" style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e8ecf1' }}>💳 查询账户余额</div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>企业账户</label>
                            <input type="text" value={balanceAddress} onChange={e => setBalanceAddress(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn" style={{ padding: '12px 24px', background: '#7c8ff5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} onClick={getBalance}>查询余额</button>
                </div>

                {/* Mint */}
                <div className="action-panel" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                    <div className="panel-title" style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e8ecf1' }}>📝 登记产品批次</div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div className="form-group"><label>扣费企业账户</label><input type="text" value={mintForm.from} onChange={e => setMintForm({ ...mintForm, from: e.target.value })} /></div>
                        <div className="form-group"><label>接收企业账户</label><input type="text" value={mintForm.to} onChange={e => setMintForm({ ...mintForm, to: e.target.value })} /></div>
                        <div className="form-group"><label>产品证书合约</label><input type="text" value={mintForm.nftAddress} onChange={e => setMintForm({ ...mintForm, nftAddress: e.target.value })} /></div>
                        <div className="form-group"><label>批次编号</label><input type="number" value={mintForm.tokenId} onChange={e => setMintForm({ ...mintForm, tokenId: e.target.value })} placeholder="1" /></div>
                        <div className="form-group"><label>产地</label><input type="text" value={mintForm.origin} onChange={e => setMintForm({ ...mintForm, origin: e.target.value })} /></div>
                    </div>
                    <button className="btn" style={{ padding: '12px 24px', background: '#7c8ff5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} onClick={mintNFT}>登记批次</button>
                </div>

                {/* Result */}
                <div className="action-panel" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                    <div className="panel-title">📋 操作结果</div>
                    {loading && <div className="loading" style={{ textAlign: 'center' }}>Processing...</div>}
                    {result && (
                        <div className="result" style={{ marginTop: '20px', padding: '20px', background: '#f5f7fa', borderRadius: '8px', border: '1px solid #dcdfe6', maxHeight: '400px', overflowY: 'auto' }}>
                            <h3 style={{ color: result.success ? '#67c23a' : '#f56c6c' }}>{result.success ? '✅ 成功' : '❌ 错误'}</h3>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify(result.data || result.error, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Operations;
