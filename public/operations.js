const API_BASE = window.location.origin;
let toastTimeout;

function showToast(title, message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const header = document.getElementById('toastHeader');
    const body = document.getElementById('toastBody');

    if (toastTimeout) clearTimeout(toastTimeout);

    header.textContent = title;
    header.className = `toast-header ${isSuccess ? 'success' : 'error'}`;
    body.textContent = message;
    toast.className = `toast ${isSuccess ? 'success' : 'error'} show`;

    toastTimeout = setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hiding');
    setTimeout(() => {
        toast.className = 'toast';
    }, 300);
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showResult(data, isError = false) {
    hideLoading();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h3 class="${isError ? 'error' : 'success'}">${isError ? '❌ 错误' : '✅ 成功'}</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
}

async function apiCall(endpoint, method = 'GET', body = null) {
    showLoading();
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(API_BASE + endpoint, options);
        const data = await response.json();

        showResult(data, !response.ok);

        if (!response.ok) {
            const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || '请求失败');
            showToast('❌ 操作失败', errorMsg, false);
        }

        return { ok: response.ok, data };
    } catch (error) {
        showResult({ error: error.message }, true);
        showToast('❌ 网络错误', error.message, false);
        return { ok: false, data: null };
    }
}

async function topup() {
    const address = document.getElementById('topupAddress').value.trim();
    const rmbStr = document.getElementById('topupAmount').value.trim();

    if (!address || !rmbStr) {
        showToast('❌ 输入错误', '请填写完整信息', false);
        return;
    }

    const rmb = parseFloat(rmbStr);
    const result = await apiCall('/topup', 'POST', { address, rmb });
    if (result.ok && result.data) {
        showToast('✅ 充值成功', `成功充值 ${rmb} RMB,当前余额: ${result.data.balance} RMB`, true);
    }
}

async function getBalance() {
    const address = document.getElementById('balanceAddress').value.trim();
    if (!address) {
        showToast('❌ 输入错误', '请填写企业账户', false);
        return;
    }
    const result = await apiCall(`/balance/${address}`);
    if (result.ok && result.data) {
        showToast('✅ 查询成功', `企业账户余额: ${result.data.balance} 元`, true);
    }
}

async function mintNFT() {
    const from = document.getElementById('mintFrom').value.trim();
    const to = document.getElementById('mintTo').value.trim();
    const nftAddress = document.getElementById('nftAddress').value.trim();
    const tokenIdStr = document.getElementById('tokenId').value.trim();
    const origin = document.getElementById('origin').value.trim();
    const harvestTimeStr = document.getElementById('harvestTime').value.trim();
    const inspectionId = document.getElementById('inspectionId').value.trim();
    const uri = document.getElementById('uri').value.trim();

    if (!from) { showToast('❌ 输入错误', '请填写扣费企业账户', false); return; }
    if (!to) { showToast('❌ 输入错误', '请填写接收企业账户', false); return; }
    if (!nftAddress) { showToast('❌ 输入错误', '请填写产品证书合约', false); return; }
    if (tokenIdStr === '') { showToast('❌ 输入错误', '请填写批次编号', false); return; }
    if (!origin) { showToast('❌ 输入错误', '请填写产地', false); return; }
    if (!harvestTimeStr) { showToast('❌ 输入错误', '请填写采收时间', false); return; }
    if (!inspectionId) { showToast('❌ 输入错误', '请填写质检编号', false); return; }

    const tokenId = parseInt(tokenIdStr);
    const harvestTime = parseInt(harvestTimeStr);

    const result = await apiCall('/relay/nft/mint', 'POST', {
        from, to, nftAddress, tokenId, origin, harvestTime, inspectionId, uri
    });
    if (result.ok) {
        showToast('✅ 登记成功', `产品批次 #${tokenId} 登记成功!`, true);
    }
}

async function transferNFT() {
    const from = document.getElementById('transferFrom').value.trim();
    const to = document.getElementById('transferTo').value.trim();
    const nftAddress = document.getElementById('transferNftAddress').value.trim();
    const tokenIdStr = document.getElementById('transferTokenId').value.trim();

    if (!from || !to || !nftAddress || !tokenIdStr) {
        showToast('❌ 输入错误', '请填写完整信息', false);
        return;
    }

    const tokenId = parseInt(tokenIdStr);
    const result = await apiCall('/relay/nft/transfer', 'POST', {
        from, to, nftAddress, tokenId
    });
    if (result.ok) {
        showToast('✅ 转移成功', `产品批次 #${tokenId} 转移成功!`, true);
    }
}

async function getBatchDetails() {
    const nftAddress = document.getElementById('detailsNftAddress').value.trim();
    const tokenIdStr = document.getElementById('detailsTokenId').value.trim();

    if (!nftAddress || !tokenIdStr) {
        showToast('❌ 输入错误', '请填写完整信息', false);
        return;
    }

    const tokenId = parseInt(tokenIdStr);
    const result = await apiCall(`/nft/batch/${nftAddress}/${tokenId}/details`);
    if (result.ok) {
        showToast('✅ 查询成功', `成功获取批次 #${tokenId} 的溯源详情`, true);
    }
}

// 设置默认采收时间为当前时间
document.getElementById('harvestTime').value = Math.floor(Date.now() / 1000);

async function loadDefaultAddress() {
    try {
        const r = await fetch(API_BASE + '/nft/default-address');
        const j = await r.json();
        if (j.ok && j.address) {
            const ids = ['nftAddress', 'transferNftAddress', 'detailsNftAddress'];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el && (!el.value || el.value.startsWith('0x5D96'))) {
                    el.value = j.address;
                }
            });
        }
    } catch (e) { }
}

loadDefaultAddress();
