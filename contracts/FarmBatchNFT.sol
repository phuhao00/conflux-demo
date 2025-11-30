// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FarmBatchNFT is ERC721URIStorage, Ownable {
    struct BatchInfo {
        string origin;
        uint64 harvestTime;
        string inspectionId;
        bytes32 contentHash;
    }

    mapping(uint256 => BatchInfo) private _batchInfo;

    event BatchInfoSet(uint256 tokenId, string origin, uint64 harvestTime, string inspectionId, bytes32 contentHash);

    constructor() ERC721("Farm Batch", "FARM-NFT") Ownable(msg.sender) {}

    function mintWithInfo(
        address to,
        uint256 tokenId,
        string memory uri,
        string memory origin,
        uint64 harvestTime,
        string memory inspectionId,
        bytes32 contentHash
    ) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _batchInfo[tokenId] = BatchInfo(origin, harvestTime, inspectionId, contentHash);
        emit BatchInfoSet(tokenId, origin, harvestTime, inspectionId, contentHash);
    }

    function getBatchInfo(uint256 tokenId) external view returns (BatchInfo memory) {
        require(_ownerOf(tokenId) != address(0), "nonexistent token");
        return _batchInfo[tokenId];
    }
}