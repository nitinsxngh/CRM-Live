const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const LeadStep = require('../models/LeadSteps');
const router = express.Router();

// Initialize the S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup for file uploads (in memory storage)
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

// Function to upload a file to S3
const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // Your S3 bucket name
    Key: `${Date.now()}_${file.originalname}`, // Generate a unique file name using timestamp
    Body: file.buffer, // File content in buffer
    ContentType: file.mimetype, // File MIME type
  };

  return s3.upload(params).promise(); // Return a promise for file upload
};

// POST route to add or update basic lead step data (without file)
router.post('/', async (req, res) => {
  const { leadId, stepName, stepDetails } = req.body;

  if (!leadId || !stepName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let leadStep = await LeadStep.findOne({ leadId, stepName });

    if (leadStep) {
      // Update existing step
      leadStep.stepDetails = stepDetails;
      await leadStep.save();
    } else {
      // Create new step
      leadStep = new LeadStep({
        leadId,
        stepName,
        stepDetails,
      });
      await leadStep.save();
    }

    res.status(201).json({ message: 'Step data saved successfully', leadStep });
  } catch (error) {
    console.error('Error saving step data:', error);
    res.status(500).json({ message: 'Error saving step data', error });
  }
});

// POST route to handle the Test Fit Out data including file uploads
router.post('/test-fit-out', upload.single('file'), async (req, res) => {
  const { leadId, stepName, floorPlanName, description } = req.body;
  const file = req.file;

  if (!leadId || !stepName || !floorPlanName || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let leadStep = await LeadStep.findOne({ leadId, stepName });

    let fileData = {};
    if (file) {
      // Upload the file to S3 and get the file URL
      const uploadResult = await uploadFileToS3(file);
      fileData = {
        fileName: file.originalname,
        fileUrl: uploadResult.Location, // S3 file URL
      };
    }

    const testFitOutDetails = {
      floorPlanName,
      description,
      ...fileData, // Include file data if uploaded
    };

    if (leadStep) {
      // Update existing step with Test Fit Out data
      leadStep.stepDetails = JSON.stringify(testFitOutDetails);
      await leadStep.save();
    } else {
      // Create a new step if it doesn't exist
      leadStep = new LeadStep({
        leadId,
        stepName,
        stepDetails: JSON.stringify(testFitOutDetails),
      });
      await leadStep.save();
    }

    res.status(201).json({ message: 'Test Fit Out data saved successfully', leadStep });
  } catch (error) {
    console.error('Error saving Test Fit Out data:', error);
    res.status(500).json({ message: 'Error saving Test Fit Out data', error });
  }
});

// GET route to fetch all steps for a lead
router.get('/:leadId', async (req, res) => {
  const { leadId } = req.params;

  try {
    const leadSteps = await LeadStep.find({ leadId });
    res.status(200).json({ leadSteps });
  } catch (error) {
    console.error('Error fetching step data:', error);
    res.status(500).json({ message: 'Error fetching step data', error });
  }
});

// Export the router
module.exports = router;
