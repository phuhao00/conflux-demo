import React, { useState } from 'react'
import { SafeAreaView, View, Text, TextInput, Button, ScrollView, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { BarCodeScanner } from 'expo-barcode-scanner'
import QRCode from 'react-native-qrcode-svg'

function Field({ label, value, onChangeText }: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text>{label}</Text>
      <TextInput style={{ borderWidth: 1, padding: 6 }} value={value} onChangeText={onChangeText} />
    </View>
  )
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3001')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [origin, setOrigin] = useState('')
  const [harvestTime, setHarvestTime] = useState('')
  const [inspectionId, setInspectionId] = useState('')
  const [nftAddress, setNftAddress] = useState('')
  const [uri, setUri] = useState('')
  const [topupAddr, setTopupAddr] = useState('')
  const [topupRmb, setTopupRmb] = useState('')
  const [balanceAddr, setBalanceAddr] = useState('')
  const [result, setResult] = useState('')
  const [photoUri, setPhotoUri] = useState('')
  const [scanning, setScanning] = useState(false)
  const [detailsAddr, setDetailsAddr] = useState('')
  const [detailsTokenId, setDetailsTokenId] = useState('')
  const [details, setDetails] = useState<any>(null)

  async function post(path: string, body: any) {
    const r = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    setResult(JSON.stringify(j))
  }

  async function get(path: string) {
    const r = await fetch(`${baseUrl}${path}`)
    const j = await r.json().catch(() => ({}))
    setResult(JSON.stringify(j))
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true })
    if (res && !res.canceled && res.assets && res.assets[0]) {
      const a: any = res.assets[0]
      setPhotoUri(a.uri)
      if (a.base64) {
        const data = `data:${a.mimeType || 'image/jpeg'};base64,${a.base64}`
        const r = await fetch(`${baseUrl}/metadata/upload-file`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
        const j = await r.json().catch(() => ({}))
        if (j && j.uri) setUri(j.uri)
      }
    }
  }

  async function toggleScan() {
    const { status } = await BarCodeScanner.requestPermissionsAsync()
    if (status !== 'granted') return
    setScanning(!scanning)
  }

  function toHttp(uri: string) {
    if (!uri) return ''
    if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.replace('ipfs://','')}`
    return uri
  }

  async function fetchDetails() {
    const r = await fetch(`${baseUrl}/nft/batch/${detailsAddr}/${detailsTokenId}/details`)
    const j = await r.json().catch(() => ({}))
    setDetails(j)
    setResult(JSON.stringify(j))
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Field label="后端地址" value={baseUrl} onChangeText={setBaseUrl} />

        <Text style={{ fontSize: 18, marginTop: 12 }}>充值人民币</Text>
        <Field label="地址" value={topupAddr} onChangeText={setTopupAddr} />
        <Field label="金额" value={topupRmb} onChangeText={setTopupRmb} />
        <Button title="充值" onPress={() => post('/topup', { address: topupAddr, rmb: Number(topupRmb) })} />

        <Text style={{ fontSize: 18, marginTop: 12 }}>查询余额</Text>
        <Field label="地址" value={balanceAddr} onChangeText={setBalanceAddr} />
        <Button title="查询" onPress={() => get(`/balance/${balanceAddr}`)} />

        <Text style={{ fontSize: 18, marginTop: 12 }}>铸造批次 NFT</Text>
        <Field label="扣费地址" value={from} onChangeText={setFrom} />
        <Field label="接收地址" value={to} onChangeText={setTo} />
        <Field label="NFT 地址" value={nftAddress} onChangeText={setNftAddress} />
        <Field label="TokenId" value={tokenId} onChangeText={setTokenId} />
        <Field label="URI(留空则自动/可上传图片)" value={uri} onChangeText={setUri} />
        <Button title="选择照片并上传到IPFS" onPress={pickImage} />
        {photoUri ? <Image source={{ uri: photoUri }} style={{ width: 120, height: 120, marginVertical: 8 }} /> : null}
        <Field label="产地" value={origin} onChangeText={setOrigin} />
        <Field label="采收时间(Unix秒)" value={harvestTime} onChangeText={setHarvestTime} />
        <Field label="质检编号" value={inspectionId} onChangeText={setInspectionId} />
        <Button title="铸造" onPress={() => post('/relay/nft/mint', { from, to, tokenId: Number(tokenId), nftAddress, uri, origin, harvestTime: Number(harvestTime), inspectionId })} />

        <Text style={{ fontSize: 18, marginTop: 12 }}>转移批次 NFT</Text>
        <Button title="转移" onPress={() => post('/relay/nft/transfer', { from, to, tokenId: Number(tokenId), nftAddress })} />

        <Text style={{ fontSize: 18, marginTop: 12 }}>扫码填充信息</Text>
        <Button title={scanning ? '停止扫码' : '开始扫码'} onPress={toggleScan} />
        {scanning ? (
          <View style={{ height: 220, marginVertical: 8 }}>
            <BarCodeScanner style={{ flex: 1 }} onBarCodeScanned={({ data }: any) => {
              setScanning(false)
              try {
                const j = JSON.parse(data)
                if (j.tokenId) setTokenId(String(j.tokenId))
                if (j.nftAddress) setNftAddress(String(j.nftAddress))
                if (j.uri) setUri(String(j.uri))
              } catch (_) {
                setTokenId(data)
              }
            }} />
          </View>
        ) : null}

        <Text style={{ fontSize: 18, marginTop: 12 }}>批次详情查询</Text>
        <Field label="NFT 地址" value={detailsAddr} onChangeText={setDetailsAddr} />
        <Field label="TokenId" value={detailsTokenId} onChangeText={setDetailsTokenId} />
        <Button title="查询详情" onPress={fetchDetails} />
        {details && details.ok ? (
          <View style={{ marginTop: 8 }}>
            <Text>产地：{details.onchain.origin}</Text>
            <Text>采收时间：{String(details.onchain.harvestTime)}</Text>
            <Text>质检编号：{details.onchain.inspectionId}</Text>
            {details.offchain && details.offchain.location ? (
              <Text>坐标：{details.offchain.location.lat},{details.offchain.location.lng}</Text>
            ) : null}
            {details.offchain && Array.isArray(details.offchain.photos) ? (
              <ScrollView horizontal style={{ marginVertical: 8 }}>
                {details.offchain.photos.map((p: string, i: number) => (
                  <Image key={i} source={{ uri: toHttp(p) }} style={{ width: 120, height: 120, marginRight: 8 }} />
                ))}
              </ScrollView>
            ) : null}
            <Text style={{ marginTop: 8 }}>二维码</Text>
            <Button title="生成签名二维码" onPress={async () => {
              const r = await fetch(`${baseUrl}/nft/qrcode-payload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nftAddress: details.nftAddress, tokenId: details.tokenId, uri: details.uri }) })
              const j = await r.json().catch(() => ({}))
              if (j && j.ok) setResult(JSON.stringify(j))
            }} />
            <QRCode value={JSON.stringify({ tokenId: details.tokenId, nftAddress: details.nftAddress, uri: details.uri })} size={160} />
          </View>
        ) : null}

        <Text style={{ fontSize: 18, marginTop: 12 }}>结果</Text>
        <Text selectable>{result}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}