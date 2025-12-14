import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [filter, setFilter] = useState('all');

    const initialCertificates = [
        {
            id: 'CERT-ORG-2024-001',
            type: 'organic',
            typeName: '有机认证',
            typeClass: 'cert-type-organic',
            icon: '🌱',
            title: '有机产品认证证书',
            product: '有机大米',
            enterprise: '黑龙江五常米业有限公司',
            issuer: '中国有机产品认证中心',
            issueDate: '2024-01-15',
            expiryDate: '2025-01-14',
            certNumber: 'ORG-2024-HLJ-001',
            status: '有效'
        },
        // ... (more dummy data)
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await apiClient.get('/certificates');
                if (res.ok && res.certificates) {
                    setCertificates(res.certificates);
                } else {
                    setCertificates(initialCertificates);
                }
            } catch (error) {
                console.error(error);
                setCertificates(initialCertificates);
            }
        };
        loadData();
    }, []);

    const filteredCertificates = filter === 'all'
        ? certificates
        : certificates.filter(c => c.type === filter);

    const getTypeColor = (type) => {
        switch (type) {
            case 'organic': return 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)';
            case 'quality': return 'linear-gradient(135deg, #409eff 0%, #66b1ff 100%)';
            case 'origin': return 'linear-gradient(135deg, #e6a23c 0%, #ebb563 100%)';
            case 'safety': return 'linear-gradient(135deg, #f56c6c 0%, #f78989 100%)';
            default: return 'linear-gradient(135deg, #7c8ff5 0%, #9b7fd9 100%)';
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-container">
                    <h1 className="page-title">数字证书</h1>
                    <p className="page-subtitle">查看和管理农产品质量认证证书</p>
                </div>
            </div>

            <div className="main-container">
                {/* Filter Tabs */}
                <div className="filter-tabs" style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {['all', 'organic', 'quality', 'origin', 'safety'].map(type => (
                        <button
                            key={type}
                            className={`filter-tab ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #dcdfe6',
                                background: filter === type ? '#7c8ff5' : 'white',
                                color: filter === type ? 'white' : 'inherit',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderColor: filter === type ? '#7c8ff5' : '#dcdfe6'
                            }}
                        >
                            {type === 'all' ? '全部证书' :
                                type === 'organic' ? '有机认证' :
                                    type === 'quality' ? '质量认证' :
                                        type === 'origin' ? '原产地认证' : '食品安全'}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="certificates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
                    {filteredCertificates.map(cert => (
                        <div key={cert.id} className="certificate-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
                            <div className="certificate-header" style={{ background: getTypeColor(cert.type), padding: '24px', color: 'white' }}>
                                <div className="certificate-badge" style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{cert.typeName}</div>
                                <div className="certificate-icon" style={{ fontSize: '48px', marginBottom: '12px' }}>{cert.icon}</div>
                                <div className="certificate-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{cert.title}</div>
                                <div className="certificate-id" style={{ fontSize: '13px', opacity: '0.9', fontFamily: 'monospace' }}>{cert.id}</div>
                            </div>
                            <div className="certificate-body" style={{ padding: '24px' }}>
                                <div className="certificate-info">
                                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e8ecf1', fontSize: '14px' }}><span style={{ color: '#8492a6' }}>产品名称</span><span style={{ fontWeight: '600', color: '#2c3e50' }}>{cert.product}</span></div>
                                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e8ecf1', fontSize: '14px' }}><span style={{ color: '#8492a6' }}>认证企业</span><span style={{ fontWeight: '600', color: '#2c3e50' }}>{cert.enterprise}</span></div>
                                    {/* ... more rows */}
                                </div>
                                <div className="certificate-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                    <button className="cert-btn" style={{ flex: 1, padding: '10px', border: '1px solid #dcdfe6', background: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={() => alert('View Details')}>查看详情</button>
                                    <button className="cert-btn primary" style={{ flex: 1, padding: '10px', border: '1px solid #7c8ff5', background: '#7c8ff5', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={() => alert('Download')}>下载证书</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Certificates;
