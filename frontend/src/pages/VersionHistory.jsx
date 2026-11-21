import { useState, useEffect } from "react";
import { getVersions, getAssetDownloadUrl } from "../services/api";

function VersionHistory() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getVersions();
      setVersions(res.data || []);
    } catch (err) {
      console.error("Failed to load version history:", err);
      setError("Unable to load version history records from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const filteredVersions = versions.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.assetTitle || "").toLowerCase().includes(q) ||
      (v.uploadedByName || "").toLowerCase().includes(q) ||
      (v.changeNotes || "").toLowerCase().includes(q) ||
      (v.versionLabel || "").toLowerCase().includes(q)
    );
  });

  const uniqueAssets = new Set(versions.map((v) => v.assetId)).size;
  const uniqueContributors = new Set(versions.map((v) => v.uploadedByName).filter(Boolean)).size;

  return (
    <div className="version-history-page">
      <div className="page-header">
        <div>
          <h1>Version History</h1>
          <p>Audit and track asset revisions, replacement files, and changes in MySQL.</p>
        </div>
        <button className="secondary-button" onClick={fetchVersions} title="Refresh versions">
          ⟳ Refresh
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Real Statistics */}
      <div className="version-stats">
        <div className="version-stat-card">
          <h3>{loading ? "..." : versions.length}</h3>
          <p>Total Version Revisions</p>
        </div>
        <div className="version-stat-card">
          <h3>{loading ? "..." : uniqueAssets}</h3>
          <p>Unique Assets Tracked</p>
        </div>
        <div className="version-stat-card">
          <h3>{loading ? "..." : uniqueContributors}</h3>
          <p>Contributors</p>
        </div>
      </div>

      <div className="version-table-container">
        <div className="version-toolbar">
          <h2>Asset Versions ({filteredVersions.length})</h2>
          <input
            type="text"
            placeholder="Search by asset title, contributor, or change notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table className="version-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Version</th>
                <th>File Size</th>
                <th>Change Notes</th>
                <th>Uploaded By</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    Loading version history from database...
                  </td>
                </tr>
              ) : filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No version records found.
                  </td>
                </tr>
              ) : (
                filteredVersions.map((v) => (
                  <tr key={v.versionId}>
                    <td>
                      <div>
                        <strong>{v.assetTitle || "Asset #" + v.assetId}</strong>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
                          Type: {v.assetType || "FILE"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="version-badge">
                        {v.versionLabel || "v" + v.versionNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.88rem" }}>
                      {v.formattedSize || "N/A"}
                    </td>
                    <td>
                      <span className="change-notes-text">
                        {v.changeNotes || "No change notes provided"}
                      </span>
                    </td>
                    <td>
                      <strong>{v.uploadedByName || "User #" + v.uploadedById}</strong>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {v.createdAt ? new Date(v.createdAt).toLocaleString() : "Database Seed"}
                    </td>
                    <td>
                      {v.assetId && (
                        <a
                          href={getAssetDownloadUrl(v.assetId)}
                          download
                          className="link-button"
                          title="Download asset file"
                        >
                          ⬇ Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VersionHistory;
