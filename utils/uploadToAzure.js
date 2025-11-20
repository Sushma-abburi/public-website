// utils/uploadToAzure.js
const { blobServiceClient, containerName } = require("../config/azureBlob");

async function uploadToAzure(fileBuffer, originalname, mimetype) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if not exists
    await containerClient.createIfNotExists({ access: "container" });

    // Unique blob name
    const blobName = `${Date.now()}-${originalname}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload buffer
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimetype }
    });

    return blockBlobClient.url; // 👈 Return file URL
  } catch (error) {
    console.log("Azure upload error:", error);
    return null;
  }
}

module.exports = uploadToAzure;
