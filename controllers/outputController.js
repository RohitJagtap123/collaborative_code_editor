const axios = require("axios");

exports.RunCode = async function (req, res) {

        const { language_id, source_code, stdin } = req.body;
      
        if (!language_id || !source_code) {
          return res.status(400).json({ error: "Language ID and source code are required!" });
        }
      
        try {
          // Submit code to Judge0 API
          const submissionResponse = await axios.post(
            `${process.env.JUDGE0_API_BASE_URL}/submissions`,
            {
              language_id,
              source_code,
              stdin,
              base64_encoded: true, // Encode request data in base64
            },
            {
              headers: {
                "X-RapidAPI-Key":"6eb6835bf9msh41cf638713f7db0p1be9b8jsn469ea9d25832",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "Content-Type": "application/json",
              },
            }
          );
      
          // Return token to the client for fetching output
          res.json({ token: submissionResponse.data.token });
        } catch (error) {
          console.error("Error while submitting code:", error.message);
          res.status(500).json({ error: "Failed to submit code for execution." });
        }
    

}


exports.GetOutput=async function (req, res) {

     const { token } = req.params;
      
        if (!token) {
          return res.status(400).json({ error: "Token is required!" });
        }
      
        try {
          // Fetch result from Judge0 using the provided token
          const result = await axios.get(`${process.env.JUDGE0_API_BASE_URL}/submissions/${token}`, {
            params: { base64_encoded: true, fields: "*" },
            headers: {
              "X-RapidAPI-Key":'6eb6835bf9msh41cf638713f7db0p1be9b8jsn469ea9d25832',
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          });
      
          if (result.data.status.id <= 2) {
            // Status 1: In Queue, 2: Processing - Client should poll again
            return res.json({ status: "Processing", output: "Execution is still in progress..." });
          }
      
          // Decode base64 encoded responses
          const decodedOutput = Buffer.from(result.data.stdout || "", "base64").toString("utf-8");
          const decodedError = Buffer.from(result.data.stderr || "", "base64").toString("utf-8");
          const decodedCompileOutput = Buffer.from(result.data.compile_output || "", "base64").toString("utf-8");
      
          // Return output, error, or compilation output
          res.json({
            status: result.data.status.description,
            output: decodedOutput || decodedError || decodedCompileOutput,
          });
        } catch (error) {
          console.error("Error while fetching output:", error.message);
          res.status(500).json({ error: "Failed to fetch code execution result." });
        }



}