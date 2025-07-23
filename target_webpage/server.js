const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https'); // Use https for simple API requests

const app = express();
const PORT = 3013;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Static username and password
const STATIC_USERNAME = 'admin';
const STATIC_PASSWORD = '=m&8e@g90NAv';
const RECAPTCHA_SECRET_KEY = '6LcXXXXX'; // Replace with your secret key
const RECAPTCHA_SITE_KEY = '6LcXXXXX'; // Replace with your site key
const PROJECT_ID = 'my-gcp-project'; // Replace with your project ID
const SERVICE_ACCOUNT_FILE_PATH = 'service-account.json';

const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');

const client = new RecaptchaEnterpriseServiceClient({
  keyFilename: SERVICE_ACCOUNT_FILE_PATH,
});

async function verifyRecaptchaV3(token, expectedAction, remoteIp) {
  const projectId = PROJECT_ID
  const siteKey = RECAPTCHA_SITE_KEY

  const request = {
    parent: `projects/${projectId}`,
    assessment: {
      event: {
        token,
        siteKey,
        userIpAddress: remoteIp,
        expectedAction,
      },
    },
  };

  try {
    const [response] = await client.createAssessment(request);

    const riskScore = response.riskAnalysis?.score || 0;
    const actionMatch = response.tokenProperties?.action === expectedAction;
    const validToken = response.tokenProperties?.valid;

    return {
      success: validToken && actionMatch,
      score: riskScore,
      reason: response.riskAnalysis?.reasons || [],
      properties: response.tokenProperties,
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return {success: false, error};
  }
}

// Route for the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle login
app.post('/login', async (req, res) => {
  const { username, password, 'g-recaptcha-response': recaptchaResponse } = req.body;

  try {
    // Verify reCAPTCHA token
    // const recaptchaResult = await verifyRecaptchaV3(recaptchaResponse);
    const recaptchaResult = await verifyRecaptchaV3(recaptchaResponse, 'login', req.ip);
    console.log(recaptchaResult);

    // Extract reCAPTCHA details
    const recaptchaSuccess = recaptchaResult.success;
    const recaptchaScore = recaptchaResult.score || 0;

    // Check if reCAPTCHA verification was successful
    if (!recaptchaSuccess || recaptchaScore < 0.5) {
      return res.redirect(`/failed.html?success=${recaptchaSuccess}&score=${recaptchaScore}`);
    }


    // Check username and password
    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      res.redirect(`/success.html?success=${recaptchaSuccess}&score=${recaptchaScore}`);
    } else {
      res.redirect(`/failed.html?success=${recaptchaSuccess}&score=${recaptchaScore}`);
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    res.status(500).send('Internal server error. Please try again later.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
