import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import "../styles/binview.css";

export default function BinView() {
  const { binId } = useParams();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBin = async () => {
      try {
        const res = await api.get(`/bin/${binId}`); // ✅ FIXED
        setFiles(res.data.files || []);
      } catch {
        setError("❌ Bin not found or no files");
      }
    };
    fetchBin();
  }, [binId]);

  const handleCopy = (fileName) => {
    const link = `http://localhost:5000/api/download/${binId}/${fileName}`;
    navigator.clipboard.writeText(link);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bin-container">
      <h2>Bin ID: {binId}</h2>
      {error && <p className="error">{error}</p>}
      <ul className="file-list">
        {files.map((file) => (
          <li key={file._id}>
            <span>{file.fileName}</span>
            <div>
              <a
                href={`http://localhost:5000/api/download/${binId}/${file.fileName}`} // ✅ FIXED
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
              <button
                className="copy-button"
                onClick={() => handleCopy(file.fileName)}
              >
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
