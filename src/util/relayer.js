const { ethers } = require('ethers')

function toCNYFromCFXWei(cfxWei, rate) {
  const cfx = Number(ethers.formatEther(cfxWei))
  return Math.ceil(cfx * Number(rate) * 100) / 100
}

async function estimateNFTTransferGas(provider, relayerKey, nftAddress, from, to, tokenId) {
  const wallet = new ethers.Wallet(relayerKey, provider)
  const iface = new ethers.Interface([
    'function safeTransferFrom(address from, address to, uint256 tokenId)',
    'error ERC721InsufficientApproval(address operator, uint256 tokenId)',
    'error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)',
    'error ERC721NonexistentToken(uint256 tokenId)',
    'error ERC721InvalidReceiver(address receiver)'
  ])
  const data = iface.encodeFunctionData('safeTransferFrom', [from, to, tokenId])
  try {
    const est = await provider.estimateGas({ from: wallet.address, to: nftAddress, data })
    return Number(est)
  } catch (e) {
    const d = e.data || e.error?.data
    try {
      const parsed = iface.parseError(d)
      throw new Error(`onchain:${parsed.name}`)
    } catch {
      throw e
    }
  }
}

async function transferNFT(provider, relayerKey, nftAddress, from, to, tokenId) {
  const wallet = new ethers.Wallet(relayerKey, provider)
  const erc721 = new ethers.Interface([
    'function safeTransferFrom(address from, address to, uint256 tokenId)'
  ])
  const tx = await wallet.sendTransaction({ to: nftAddress, data: erc721.encodeFunctionData('safeTransferFrom', [from, to, tokenId]) })
  return tx
}

async function estimateNFTMintGas(provider, relayerKey, nftAddress, to, tokenId, uri, origin, harvestTime, inspectionId, contentHash) {
  const wallet = new ethers.Wallet(relayerKey, provider)
  const iface = new ethers.Interface([
    'function mintWithInfo(address to, uint256 tokenId, string uri, string origin, uint64 harvestTime, string inspectionId, bytes32 contentHash)',
    'error OwnableUnauthorizedAccount(address account)',
    'error OwnableInvalidOwner(address owner)',
    'error ERC721InvalidTokenId(uint256 tokenId)',
    'error ERC721InvalidReceiver(address receiver)'
  ])
  const data = iface.encodeFunctionData('mintWithInfo', [to, tokenId, uri, origin, harvestTime, inspectionId, contentHash])
  try {
    const est = await provider.estimateGas({ from: wallet.address, to: nftAddress, data })
    return Number(est)
  } catch (e) {
    const d = e.data || e.error?.data
    try {
      const parsed = iface.parseError(d)
      throw new Error(`onchain:${parsed.name}`)
    } catch {
      throw e
    }
  }
}

async function mintNFTWithInfo(provider, relayerKey, nftAddress, to, tokenId, uri, origin, harvestTime, inspectionId, contentHash) {
  const wallet = new ethers.Wallet(relayerKey, provider)
  const iface = new ethers.Interface([
    'function mintWithInfo(address to, uint256 tokenId, string uri, string origin, uint64 harvestTime, string inspectionId, bytes32 contentHash)'
  ])
  const tx = await wallet.sendTransaction({ to: nftAddress, data: iface.encodeFunctionData('mintWithInfo', [to, tokenId, uri, origin, harvestTime, inspectionId, contentHash]) })
  return tx
}

module.exports = { estimateNFTTransferGas, transferNFT, estimateNFTMintGas, mintNFTWithInfo, costCNY: (cfxWei, rate) => toCNYFromCFXWei(cfxWei, rate) }
