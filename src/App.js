import React, { useState } from "react";
import axios from "axios";

const App = () => {
  // AssemblyAI API
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "cd610432583949c2b0404f55a064ec75",
      "content-type": "application/json",
      "transfer-encoding": "chunked",
    },
  });

  // State variables
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      alert("Please select an audio file.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedFile);

    try {
      const uploadResponse = await assembly.post("/upload", selectedFile);

      if (uploadResponse.status === 200) {
        const uploadURL = uploadResponse.data.upload_url;

        submitTranscription(uploadURL);
      } else {
        alert("File upload to AssemblyAI failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the file.");
    }
  };

  const submitTranscription = (uploadURL) => {
    setIsLoading(true);
    assembly
      .post("/transcript", { audio_url: uploadURL, language_detection: true })
      .then((response) => {
        const transcriptID = response.data.id;

        checkTranscriptionStatus(transcriptID);
      })
      .catch((error) => {
        console.error(error);
        alert("Transcription request to AssemblyAI failed.");
      });
  };

  const checkTranscriptionStatus = (transcriptID) => {
    const interval = setInterval(async () => {
      try {
        const response = await assembly.get(`/transcript/${transcriptID}`);
        const transcriptData = response.data;
        console.log(response);

        if (transcriptData.status === "completed") {
          clearInterval(interval);
          setIsLoading(false);
          setTranscript(transcriptData.text);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while checking transcription status.");
      }
    }, 1000);
  };
  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    element.click();
  };
  return (
    <div>
      <h1>Audio Transcription App</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {isLoading ? <p>Transcribing...</p> : <p>{transcript}</p>}

      {transcript && (
        <button onClick={downloadTranscript}>Download Transcript</button>
      )}
    </div>
  );
};

export default App;
