// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title INFT - Intelligent Non-Fungible Token (ERC-7857)
 * @notice NFT standard for tokenizing AI agents with encrypted metadata.
 * @dev Extends ERC-721 with encrypted metadata, secure transfers, and usage authorization.
 *
 * Deploy on 0G Chain:
 *   - Testnet: https://evmrpc-testnet.0g.ai (Chain ID: 16602)
 *   - Mainnet: https://evmrpc.0g.ai (Chain ID: 16661)
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract INFT is ERC721, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;

    struct TokenMetadata {
        bytes encryptedData;
        bytes32 metadataHash;
        uint256 createdAt;
    }

    struct UsageAuth {
        address user;
        uint256 expiry;
    }

    mapping(uint256 => TokenMetadata) private _metadata;
    mapping(uint256 => UsageAuth[]) private _authorizations;

    event MetadataUpdated(uint256 indexed tokenId, bytes32 metadataHash);
    event UsageAuthorized(uint256 indexed tokenId, address indexed user, uint256 expiry);
    event AgentTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("0G Intelligent NFT", "INFT") Ownable(msg.sender) {}

    /**
     * @notice Mint a new INFT with encrypted AI agent metadata.
     * @param to Address to mint to
     * @param encryptedMetadata Encrypted agent data (model, capabilities, prompts)
     * @param metadataHash Hash of the unencrypted metadata for verification
     */
    function mint(
        address to,
        bytes memory encryptedMetadata,
        bytes32 metadataHash
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);

        _metadata[tokenId] = TokenMetadata({
            encryptedData: encryptedMetadata,
            metadataHash: metadataHash,
            createdAt: block.timestamp
        });

        emit MetadataUpdated(tokenId, metadataHash);

        return tokenId;
    }

    /**
     * @notice Transfer an INFT with re-encrypted metadata.
     * @dev Follows ERC-7857 secure transfer: metadata is re-encrypted for the new owner.
     * @param from Current owner
     * @param to New owner
     * @param tokenId Token to transfer
     * @param newEncryptedMetadata Metadata re-encrypted for the new owner
     * @param proof Proof of correct re-encryption (from TEE or ZKP oracle)
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory newEncryptedMetadata,
        bytes memory proof
    ) external nonReentrant {
        require(ownerOf(tokenId) == from, "INFT: not the owner");
        require(
            msg.sender == from || isApprovedForAll(from, msg.sender) || getApproved(tokenId) == msg.sender,
            "INFT: not authorized"
        );
        require(proof.length > 0, "INFT: proof required");

        // Update encrypted metadata for new owner
        _metadata[tokenId].encryptedData = newEncryptedMetadata;

        // Clear authorizations on transfer
        delete _authorizations[tokenId];

        // Transfer ownership
        _transfer(from, to, tokenId);

        emit AgentTransferred(tokenId, from, to);
    }

    /**
     * @notice Authorize another address to use the agent without transferring ownership.
     * @param tokenId Token to authorize usage for
     * @param user Address to authorize
     * @param expiry Unix timestamp when authorization expires
     */
    function authorizeUsage(
        uint256 tokenId,
        address user,
        uint256 expiry
    ) external {
        require(ownerOf(tokenId) == msg.sender, "INFT: not the owner");
        require(expiry > block.timestamp, "INFT: expiry must be in the future");

        _authorizations[tokenId].push(UsageAuth({
            user: user,
            expiry: expiry
        }));

        emit UsageAuthorized(tokenId, user, expiry);
    }

    /**
     * @notice Clone an INFT, creating a copy with the same metadata.
     * @param tokenId Token to clone
     * @param to Address to mint the clone to
     */
    function clone(uint256 tokenId, address to) external returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "INFT: not the owner");

        uint256 newTokenId = _nextTokenId++;
        _safeMint(to, newTokenId);

        _metadata[newTokenId] = TokenMetadata({
            encryptedData: _metadata[tokenId].encryptedData,
            metadataHash: _metadata[tokenId].metadataHash,
            createdAt: block.timestamp
        });

        emit MetadataUpdated(newTokenId, _metadata[tokenId].metadataHash);

        return newTokenId;
    }

    /**
     * @notice Check if an address is authorized to use an agent.
     */
    function isAuthorized(uint256 tokenId, address user) external view returns (bool) {
        if (ownerOf(tokenId) == user) return true;

        UsageAuth[] storage auths = _authorizations[tokenId];
        for (uint256 i = 0; i < auths.length; i++) {
            if (auths[i].user == user && auths[i].expiry > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get the metadata hash for a token.
     */
    function getMetadataHash(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "INFT: token does not exist");
        return _metadata[tokenId].metadataHash;
    }

    /**
     * @notice Get the encrypted metadata for a token (only useful to the owner with the key).
     */
    function getEncryptedMetadata(uint256 tokenId) external view returns (bytes memory) {
        require(_ownerOf(tokenId) != address(0), "INFT: token does not exist");
        return _metadata[tokenId].encryptedData;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
