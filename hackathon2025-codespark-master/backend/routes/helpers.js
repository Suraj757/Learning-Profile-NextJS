/**
 * Builds the full S3 URL for a game thumbnail
 * @param {string} thumbnail - The thumbnail filename/key from the database
 * @returns {string} The complete S3 URL
 */
function buildThumbnailUrl(thumbnail) {
  if (!thumbnail) {
    return null;
  }

  const s3Bucket = process.env.S3_BUCKET;
  const s3BaseUrl = `https://${s3Bucket}.s3.us-east-1.amazonaws.com`;
  return `${s3BaseUrl}/${thumbnail}`;
}

module.exports = {
  buildThumbnailUrl,
};
