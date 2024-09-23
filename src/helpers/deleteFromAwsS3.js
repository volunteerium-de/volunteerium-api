const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { AWS_S3_BUCKET_REGION, AWS_S3_BUCKET_NAME } = require("../../setups");

// Initialize the S3 client with your configuration
const client = new S3Client({ region: AWS_S3_BUCKET_REGION });

const bucketName = AWS_S3_BUCKET_NAME;

// Delete single object
async function deleteObjectByDateKeyNumber(keyNumber) {
  try {
    // List the objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    const listResponse = await client.send(listCommand);

    // Filter the objects to find the one that includes the key number
    const objects = listResponse.Contents;
    const objectToDelete = objects.find((obj) => obj.Key.includes(keyNumber));

    if (!objectToDelete) {
      console.log(`No object found with key number: ${keyNumber}`);
      return;
    }

    // Step 3: Delete the object
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: [{ Key: objectToDelete.Key }],
      },
    });
    const deleteResponse = await client.send(deleteCommand);

    console.log("Delete Response:", deleteResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Delete multiple objects
async function deleteObjectsByDateKeyNumbers(keyNumbers) {
  try {
    // List the objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    const listResponse = await client.send(listCommand);

    // Filter the objects to find those that match any of the key numbers
    const objects = listResponse.Contents;
    const objectsToDelete = objects.filter((obj) =>
      keyNumbers.some((keyNumber) => obj.Key.includes(keyNumber))
    );

    if (objectsToDelete.length === 0) {
      console.log("No objects found with the provided key numbers.");
      return;
    }

    // Prepare the keys for deletion
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete.map((obj) => ({ Key: obj.Key })),
      },
    };

    // Delete the objects
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const deleteResponse = await client.send(deleteCommand);

    console.log("Delete Response:", deleteResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = {
  deleteObjectByDateKeyNumber,
  deleteObjectsByDateKeyNumbers,
};
