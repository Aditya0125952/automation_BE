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
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).send("❌ GITHUB_TOKEN not configured in server");
    }

    // 🔥 BUILD CLEAN JSON FOR GITHUB
    const fePayload = {
      applicantOverrides: req.body.applicantOverrides || {}
    };

    console.log("📦 Sending FE_DATA to GitHub:", fePayload);

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
            FE_DATA: JSON.stringify(fePayload)  // ✅ THIS IS THE FIX
          }
        }),
      }
    );

    if (response.status === 204) {
      res.send('✅ Automation triggered in GitHub!');
    } else {
      const errorText = await response.text();
      res.status(500).send(`❌ GitHub rejected request: ${response.status} - ${errorText}`);
    }

  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
