import React, { useState } from "react";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const transcribeAndDownload = async () => {
    setIsLoading(true);

    try {
      // Step 3: Upload the local file to the AssemblyAI API to get the upload_url.
      const uploadUrlResponse = await fetch(
        "https://api.assemblyai.com/v2/upload-url",
        {
          method: "POST",
          headers: {
            Authorization: "6bdccc2045804a77b4ac2a5ba59a0e28", // Replace with your AssemblyAI API token
            "Content-Type": "application/json",
          },
        }
      );

      if (uploadUrlResponse.status !== 200) {
        throw new Error("Failed to obtain upload URL.");
      }

      const uploadUrlData = await uploadUrlResponse.json();
      const uploadUrl = uploadUrlData.upload_url;

      // Step 4: Create a JSON payload with the upload_url.
      const payload = {
        audio_url: uploadUrl,
      };

      // Step 5: Make a POST request to the AssemblyAI API to start transcription.
      const transcriptionResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: {
            Authorization: "6bdccc2045804a77b4ac2a5ba59a0e28", // Replace with your AssemblyAI API token
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (transcriptionResponse.status !== 200) {
        throw new Error("Transcription request failed.");
      }

      const transcriptionData = await transcriptionResponse.json();
      const transcriptionId = transcriptionData.id;

      // Step 6: Poll the API for the transcription status.
      let status = "";
      while (status !== "completed") {
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
          {
            headers: {
              Authorization: "6bdccc2045804a77b4ac2a5ba59a0e28", // Replace with your AssemblyAI API token
            },
          }
        );
        const statusData = await statusResponse.json();
        status = statusData.status;

        if (status === "completed") {
          // Retrieve the transcript from the API response.
          setTranscription(statusData.transcript);
        } else {
          // Sleep for a few seconds before checking the status again.
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (error) {
      // Handle errors here.
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>AssemblyAI Audio Transcriber</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button
        onClick={transcribeAndDownload}
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? "Transcribing..." : "Transcribe and Download"}
      </button>
      {transcription && (
        <div>
          <h3>Transcription Output</h3>
          <pre>{transcription}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
