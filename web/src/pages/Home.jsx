import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import apiClient from '../api/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Home = () => {
    const [stats, setStats] = useState({
        productTypes: 66,
        traceBatches: 3030002,
        enterprises: 331163
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await apiClient.get('/statistics');
                if (data.ok && data.stats) {
                    setStats(data.stats);
                }
            } catch (e) {
                console.error('Error loading stats:', e);
            }
        };
        loadStats();
    }, []);

    const chartData = {
        labels: ['17 Nov', '', '', '24 Nov', '', '', '1 Dec', '', '', '8 Dec'],
        datasets: [{
            label: '每日溯源记录数量',
            data: [14000, 13500, 13000, 12000, 11500, 11000, 10000, 9500, 9000, 8000],
            borderColor: '#a8b5f5',
            backgroundColor: 'rgba(168, 181, 245, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 1.5
        }]
    };

    const enterpriseChartData = {
        labels: ['17 Nov', '', '', '24 Nov', '', '', '1 Dec', '', '', '8 Dec'],
        datasets: [{
            label: '新增企业账户趋势',
            data: [10, 25, 35, 30, 45, 55, 70, 60, 50, 30],
            borderColor: '#c5b3e6',
            backgroundColor: 'rgba(197, 179, 230, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 1.5
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: '#f0f2f5',
                    drawBorder: false
                },
                ticks: {
                    color: '#b0b8c8',
                    font: { size: 11 },
                    callback: function (value) {
                        return value >= 1000 ? (value / 1000) + 'k' : value;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#b0b8c8',
                    font: { size: 11 }
                }
            }
        }
    };

    const enterpriseChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                beginAtZero: true
            }
        }
    };

    return (
        <div>
            {/* Search Section */}
            <div className="search-section" style={{ background: 'linear-gradient(135deg, #7c8ff5 0%, #9b7fd9 100%)', padding: '60px 40px', color: 'white' }}>
                <div className="search-container" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 className="search-title" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px' }}>农产品链上资产管理平台</h1>
                    <p className="search-subtitle" style={{ fontSize: '16px', opacity: '0.9', marginBottom: '30px' }}>基于 Conflux 的农产品溯源与人民币 Gas 代付系统</p>
                    <div className="search-box" style={{ display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
                        <input type="text" className="search-input" placeholder="搜索企业账户 / 批次编号 / 产品证书 / 溯源码" style={{ flex: 1, padding: '16px 20px', border: 'none', borderRadius: '8px', fontSize: '15px' }} />
                        <button className="search-btn" style={{ padding: '16px 40px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>🔍 搜索</button>
                    </div>
                </div>
            </div>

            <div className="main-container">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">产品种类总数</div>
                        <div className="stat-value">{stats.productTypes}</div>
                        <div className="stat-change">+3 本月新增</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">溯源批次总数</div>
                        <div className="stat-value">{stats.traceBatches.toLocaleString()}</div>
                        <div className="stat-change">11 秒前更新</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">注册企业数量</div>
                        <div className="stat-value">{stats.enterprises.toLocaleString()}</div>
                        <div className="stat-change">+45 今日新增</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">服务费用</div>
                        <div className="stat-value">0.00 元</div>
                        <div className="stat-change">政府补贴</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title">溯源记录趋势</div>
                            <a className="chart-link">查看详情 →</a>
                        </div>
                        <div style={{ height: '250px' }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title">企业注册增长</div>
                            <a className="chart-link">查看详情 →</a>
                        </div>
                        <div style={{ height: '250px' }}>
                            <Line data={enterpriseChartData} options={enterpriseChartOptions} />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="table-section">
                    <div className="table-tabs">
                        <div className="table-tab active">最新产品批次</div>
                        <div className="table-tab">最新溯源记录</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>批次编号</th>
                                <th>产品种类</th>
                                <th>溯源次数</th>
                                <th>批次证书</th>
                                <th>生产企业</th>
                                <th>产地</th>
                                <th>质检状态</th>
                                <th>登记时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>20241210001</td>
                                <td><span className="badge badge-success">有机茶叶</span></td>
                                <td>0</td>
                                <td><a href="#" className="hash-link">0x9f8b8f790b...</a></td>
                                <td><a href="#" className="hash-link">云南普洱茶业</a></td>
                                <td>云南普洱</td>
                                <td><span className="badge badge-success">已通过</span></td>
                                <td className="age">11 秒前</td>
                            </tr>
                            {/* More rows... */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Home;
