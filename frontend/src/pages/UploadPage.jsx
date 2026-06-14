import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UploadCloud, Trash2, Copy, Check, FileText } from "lucide-react";
import api from "../utils/api";
import "../styles/upload.css";

export default function UploadPage() {
  const [binId, setBinId] = useState("");
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleCopyLink = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create bin on load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const createBin = async () => {
      try {
        const res = await api.get("/create-bin");
        setBinId(res.data.binId);
      } catch (err) {
        console.error("Error creating bin:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    createBin();
  }, [token, navigate]);

  // Upload file
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/upload/${binId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Fetch updated files
      const res = await api.get(`/bin/${binId}`);
      setFiles(res.data.files || []);
      setStats({
        createdAt: new Date(res.data.createdAt).toLocaleString(),
        expiresAt: new Date(res.data.expiresAt).toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Delete file
  const handleDelete = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      await api.delete(`/delete/${binId}/${fileName}`);
      
      // Fetch updated files list
      const res = await api.get(`/bin/${binId}`);
      setFiles(res.data.files || []);
      setStats(prev => ({
        ...prev,
        updatedAt: new Date().toLocaleString(),
      }));
    } catch (err) {
      console.error("Error deleting file:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="upload-page-container">
      {/* Header Section */}
      <header className="upload-header">
        <div className="header-logo">
          <UploadCloud className="logo-icon" size={28} />
          <h1>UploadHub</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Bin Info Container */}
      <section className="bin-info-section">
        <div className="bin-info-card">
          <div className="bin-details">
            <p><span className="detail-label">Bin ID:</span> {binId || "Creating..."}</p>
            {binId && (
              <div className="share-link-wrapper">
                <span className="detail-label">Share Link:</span> 
                <span className="share-link">{window.location.origin}/bin/{binId}</span>
                <button 
                  className={`copy-link-btn ${copied ? "copied" : ""}`}
                  onClick={() => handleCopyLink(`${window.location.origin}/bin/${binId}`)}
                  title="Copy Share Link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/bin/${binId}`}
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
              <UploadCloud className="upload-icon" size={40} />
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
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="file-name" title={file.fileName}>{file.fileName}</td>
                    <td>{file.type}</td>
                    <td>{(file.size / 1024).toFixed(1)} KB</td>
                    <td>{new Date(file.uploadDate).toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="delete-btn" onClick={() => handleDelete(file.fileName)}>
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FileText size={32} className="empty-icon" />
              <p>No files uploaded yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}