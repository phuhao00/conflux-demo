import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Initial dummy data to match products.html fallback
    const initialProducts = [
        {
            id: 1,
            name: '有机大米',
            category: 'grain',
            categoryName: '粮食作物',
            icon: '🌾',
            desc: '来自黑龙江五常的优质有机大米，无农药无化肥，口感香甜软糯',
            batches: 1250,
            enterprises: 45,
            color: '#FFD700'
        },
        // ... (add other dummy products if needed or just rely on API)
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get('/products');
                if (res.ok && res.products) {
                    const apiProducts = res.products.map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        categoryName: p.categoryName || p.category_name,
                        icon: p.icon,
                        desc: p.description || p.desc,
                        batches: p.batches,
                        enterprises: p.enterprises,
                        color: p.color
                    }));
                    setProducts(apiProducts);
                } else {
                    setProducts(initialProducts);
                }
            } catch (error) {
                console.error(error);
                setProducts(initialProducts);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    const handleFilter = (category) => {
        setFilter(category);
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-container">
                    <h1 className="page-title">产品种类</h1>
                    <p className="page-subtitle">浏览平台上的各类农产品</p>
                </div>
            </div>

            <div className="main-container">
                {/* Filter Section */}
                <div className="filter-section" style={{
                    background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'
                }}>
                    <span className="filter-label" style={{ fontWeight: '600', color: '#2c3e50' }}>分类筛选：</span>
                    {['all', 'grain', 'vegetable', 'fruit', 'tea', 'other'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => handleFilter(cat)}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #dcdfe6',
                                background: filter === cat ? '#7c8ff5' : 'white',
                                color: filter === cat ? 'white' : 'inherit',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderColor: filter === cat ? '#7c8ff5' : '#dcdfe6'
                            }}
                        >
                            {cat === 'all' ? '全部' :
                                cat === 'grain' ? '粮食作物' :
                                    cat === 'vegetable' ? '蔬菜' :
                                        cat === 'fruit' ? '水果' :
                                            cat === 'tea' ? '茶叶' : '其他'}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }} onClick={() => alert(`View product: ${product.name}`)}>
                            <div className="product-image" style={{
                                width: '100%', height: '200px',
                                background: `linear-gradient(135deg, ${product.color}dd 0%, ${product.color}88 100%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px'
                            }}>
                                {product.icon}
                            </div>
                            <div className="product-info" style={{ padding: '20px' }}>
                                <div className="product-name" style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>{product.name}</div>
                                <span className="product-category" style={{ display: 'inline-block', padding: '4px 12px', background: '#e8f5e9', color: '#4caf50', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>{product.categoryName}</span>
                                <div className="product-desc" style={{ color: '#5a6c7d', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{product.desc}</div>
                                <div className="product-stats" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e8ecf1' }}>
                                    <div className="product-stat" style={{ textAlign: 'center' }}>
                                        <div className="product-stat-value" style={{ fontSize: '18px', fontWeight: '700', color: '#7c8ff5' }}>{product.batches}</div>
                                        <div className="product-stat-label" style={{ fontSize: '12px', color: '#8492a6', marginTop: '4px' }}>溯源批次</div>
                                    </div>
                                    <div className="product-stat" style={{ textAlign: 'center' }}>
                                        <div className="product-stat-value" style={{ fontSize: '18px', fontWeight: '700', color: '#7c8ff5' }}>{product.enterprises}</div>
                                        <div className="product-stat-label" style={{ fontSize: '12px', color: '#8492a6', marginTop: '4px' }}>生产企业</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;
