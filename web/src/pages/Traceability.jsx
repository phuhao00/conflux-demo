import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Traceability = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const initialRecords = [
        {
            id: 'TB20241210001',
            product: '有机大米',
            icon: '🌾',
            status: 'verified',
            statusText: '已完成',
            enterprise: '黑龙江五常米业',
            origin: '黑龙江五常',
            timeline: [
                { title: '种植阶段', time: '2024-05-15 08:00', desc: '在黑龙江五常有机种植基地开始播种', location: '黑龙江五常', operator: '张师傅' },
                // ... simplified
            ]
        },
        // ... (can add more dummy)
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await apiClient.get('/trace');
                if (res.ok && res.records) {
                    setRecords(res.records);
                    setFilteredRecords(res.records);
                } else {
                    setRecords(initialRecords);
                    setFilteredRecords(initialRecords);
                }
            } catch (error) {
                console.error(error);
                setRecords(initialRecords);
                setFilteredRecords(initialRecords);
            }
        };
        loadData();
    }, []);

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredRecords(records);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = records.filter(r =>
            r.id.toLowerCase().includes(lower) ||
            r.product.toLowerCase().includes(lower) ||
            r.enterprise.toLowerCase().includes(lower) ||
            r.origin.toLowerCase().includes(lower)
        );
        setFilteredRecords(filtered);
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-container">
                    <h1 className="page-title">溯源管理</h1>
                    <p className="page-subtitle">追踪农产品从生产到流通的全过程</p>
                </div>
            </div>

            <div className="main-container">
                {/* Stats Row */}
                <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                    <div className="stat-box" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                        <div className="stat-box-value" style={{ fontSize: '32px', fontWeight: '700', color: '#7c8ff5', marginBottom: '8px' }}>3,245</div>
                        <div className="stat-box-label" style={{ fontSize: '14px', color: '#8492a6' }}>今日溯源查询</div>
                    </div>
                    {/* More stats... */}
                </div>

                {/* Search */}
                <div className="search-bar" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
                    <div className="search-input-group" style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            placeholder="输入批次编号、产品名称或企业名称搜索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ flex: 1, padding: '12px 16px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' }}
                        />
                        <button className="btn" onClick={handleSearch}>🔍 搜索</button>
                    </div>
                </div>

                {/* List */}
                <div id="traceList">
                    {filteredRecords.map(record => (
                        <div key={record.id} className="trace-card" style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div className="trace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e8ecf1' }}>
                                <div className="trace-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="trace-icon" style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(135deg, #7c8ff5 0%, #9b7fd9 100%)' }}>{record.icon}</div>
                                    <div className="trace-info">
                                        <div className="trace-name" style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>{record.product}</div>
                                        <div className="trace-id" style={{ fontSize: '13px', color: '#8492a6', fontFamily: 'monospace' }}>批次编号: {record.id}</div>
                                    </div>
                                </div>
                                <div className={`trace-status status-${record.status}`} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: record.status === 'verified' ? '#e8f5e9' : '#fff3e0', color: record.status === 'verified' ? '#4caf50' : '#ff9800' }}>
                                    {record.statusText}
                                </div>
                            </div>
                            {/* Timeline */}
                            <div className="trace-timeline" style={{ position: 'relative', paddingLeft: '40px' }}>
                                {record.timeline.map((item, idx) => (
                                    <div key={idx} className="timeline-item" style={{ position: 'relative', paddingBottom: '24px' }}>
                                        <div className="timeline-dot" style={{ position: 'absolute', left: '-28px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#7c8ff5', border: '3px solid white', boxShadow: '0 0 0 2px #7c8ff5' }}></div>
                                        {idx < record.timeline.length - 1 && <div className="timeline-line" style={{ position: 'absolute', left: '-21px', top: '20px', bottom: '0', width: '2px', background: '#e8ecf1' }}></div>}
                                        <div className="timeline-content" style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px' }}>
                                            <div className="timeline-title" style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{item.title}</span>
                                                <span className="timeline-time" style={{ fontSize: '12px', color: '#8492a6' }}>{item.time}</span>
                                            </div>
                                            <div className="timeline-desc" style={{ fontSize: '14px', color: '#5a6c7d', lineHeight: '1.6' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Traceability;
