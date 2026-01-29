import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run-automation', async (req, res) => {
  try {
    const applicantOverrides = req.body.applicantOverrides || {};
    const lenderOverrides = req.body.lenderSelectionOverrides || {};

    console.log("📨 RAW BODY FROM FE:", req.body);
    console.log("📧 EMAIL RECEIVED:", applicantOverrides.email);

   const rawData = {
  applicantOverrides: {
    email: applicantOverrides.email
  },
  lenderOverrides:{
    dcplan : lenderOverrides.dcplan || ""
  }
};

// 🔐 Encode to Base64 so GitHub doesn’t corrupt JSON
const feData = Buffer.from(JSON.stringify(rawData)).toString('base64');

    console.log("🚀 SENDING TO GITHUB AS FE_DATA:", feData);

    const response = await fetch(
      'https://api.github.com/repos/Aditya0125952/RBA_automation-script/actions/workflows/run-automation.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          ref: "RbaScript",
          inputs: {
            FE_DATA: feData   // 🔥 Proper JSON string
          }
        })
      }
    );

    const text = await response.text();

    if (response.status === 204) {
      res.send('✅ Automation REALLY triggered in GitHub!');
    } else {
      res.status(500).send(`❌ GitHub rejected request: ${text}`);
    }

  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
