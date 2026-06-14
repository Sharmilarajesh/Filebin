import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AlertTriangle, Download, Copy, FolderOpen } from "lucide-react";
import api from "../utils/api";
import "../styles/binview.css";

export default function BinView() {
  const { binId } = useParams();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBin = async () => {
      try {
        const res = await api.get(`/public-bin/${binId}`);
        setFiles(res.data.files || []);
      } catch {
        setError("Bin not found or no files");
      }
    };
    fetchBin();
  }, [binId]);

  const handleCopy = (fileName) => {
    const link = `${api.defaults.baseURL}/download/${binId}/${fileName}`;
    navigator.clipboard.writeText(link);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bin-container">
      <h2>
        <FolderOpen size={20} className="bin-heading-icon" />
        Bin ID: {binId}
      </h2>
      {error && (
        <p className="error">
          <AlertTriangle size={16} />
          {error}
        </p>
      )}
      <ul className="file-list">
        {files.map((file) => (
          <li key={file._id}>
            <span>{file.fileName}</span>
            <div className="bin-actions">
              <a
                href={`${api.defaults.baseURL}/download/${binId}/${file.fileName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-link-btn"
              >
                <Download size={14} />
                Download
              </a>
              <button
                className="copy-button"
                onClick={() => handleCopy(file.fileName)}
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
