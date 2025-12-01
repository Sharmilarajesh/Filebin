import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/upload.css";

export default function UploadPage() {
  const [binId, setBinId] = useState("");
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Create bin on load
  useEffect(() => {
    const createBin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/create-bin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBinId(res.data.binId);
      } catch (err) {
        console.error(err);
      }
    };
    createBin();
  }, [token]);

  // Upload file
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`http://localhost:5000/api/upload/${binId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch updated files
      const res = await axios.get(`http://localhost:5000/api/bin/${binId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
      setStats({
        createdAt: new Date(res.data.createdAt).toLocaleString(),
        expiresAt: new Date(res.data.expiresAt).toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Header Section */}
      <header className="upload-header">
        <h1>UploadHub</h1>
      </header>

      {/* Bin Info Container */}
      <section className="bin-info-section">
        <div className="bin-info-card">
          <div className="bin-details">
            <p><span className="detail-label">Bin ID:</span> {binId || "Creating..."}</p>
            {binId && (
              <p><span className="detail-label">Share Link:</span> 
                <span className="share-link">http://localhost:5173/bin/{binId}</span>
              </p>
            )}
            {stats.createdAt && (
              <div className="bin-timestamps">
                <p><span className="detail-label">Created:</span> {stats.createdAt}</p>
                <p><span className="detail-label">Updated:</span> {stats.updatedAt}</p>
                <p><span className="detail-label">Expires:</span> {stats.expiresAt}</p>
              </div>
            )}
          </div>
          {binId && (
            <div className="qr-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:5173/bin/${binId}`}
                alt="QR Code"
                className="qr-code"
              />
              <p className="qr-label">Scan to share</p>
            </div>
          )}
        </div>
      </section>

      {/* Upload Container */}
      <section className="upload-section">
        <div className="upload-card">
          <label className="upload-area">
            <div className="upload-content">
              <svg className="upload-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              <p className="upload-title">Drag & drop files or click to browse</p>
              <p className="upload-subtitle">Supports all file types</p>
            </div>
            <input type="file" onChange={handleUpload} className="file-input" />
          </label>
        </div>
      </section>

      {/* Files Container */}
      <section className="files-section">
        <div className="files-card">
          <h2 className="files-title">Uploaded Files</h2>
          {files.length > 0 ? (
            <table className="files-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="file-name">{file.fileName}</td>
                    <td>{file.type}</td>
                    <td>{(file.size / 1024).toFixed(1)} KB</td>
                    <td>{new Date(file.uploadDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No files uploaded yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}