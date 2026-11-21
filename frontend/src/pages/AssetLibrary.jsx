import { useState, useEffect } from "react";
import {
  getAssets,
  getCategories,
  deleteAsset,
  getAssetPreviewUrl,
  getAssetDownloadUrl,
} from "../services/api";

function AssetLibrary({ onUpload, onEditAsset }) {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("grid");

  // Detail Modal
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [assetsRes, catsRes] = await Promise.all([
        getAssets(),
        getCategories(),
      ]);

      setAssets(assetsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error("Failed to load assets:", err);
      setError("Unable to load assets from server. Check that backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (asset) => {
    try {
      await deleteAsset(asset.assetId || asset.id);
      setDeleteConfirmAsset(null);
      if (selectedAsset?.id === (asset.assetId || asset.id)) {
        setSelectedAsset(null);
      }
      setActionMessage(`Asset "${asset.title}" deleted successfully.`);
      setTimeout(() => setActionMessage(""), 4000);
      fetchData();
    } catch (err) {
      alert("Failed to delete asset: " + (err.friendlyMessage || err.message));
    }
  };

  // Filter & Sort Logic
  const filteredAssets = assets
    .filter((asset) => {
      const title = (asset.title || asset.name || "").toLowerCase();
      const desc = (asset.description || "").toLowerCase();
      const cat = (asset.categoryName || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = !q || title.includes(q) || desc.includes(q) || cat.includes(q);

      const matchesCategory =
        categoryFilter === "All" ||
        String(asset.categoryId) === String(categoryFilter) ||
        asset.categoryName === categoryFilter;

      const matchesType =
        typeFilter === "All" ||
        (asset.assetType && asset.assetType.toUpperCase() === typeFilter.toUpperCase());

      const matchesStatus =
        statusFilter === "All" ||
        (asset.status && asset.status.toUpperCase() === statusFilter.toUpperCase());

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "size") {
        return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
      }
      return 0;
    });

  const getBadgeTypeClass = (type = "") => {
    const t = type.toUpperCase();
    if (t === "IMAGE") return "type-badge image-badge";
    if (t === "VIDEO") return "type-badge video-badge";
    if (t === "AUDIO") return "type-badge audio-badge";
    return "type-badge";
  };

  const getStatusClass = (status = "") => {
    const s = status.toLowerCase();
    if (s === "published") return "status published";
    if (s === "archived") return "status archived";
    return "status draft";
  };

  return (
    <div className="asset-library-page">
      {/* Header */}
      <div className="asset-page-header">
        <div>
          <h1>Asset Library</h1>
          <p>Explore, filter, preview, and download your media assets from MySQL.</p>
        </div>

        <button className="primary-button" onClick={onUpload}>
          ＋ Upload New Asset
        </button>
      </div>

      {actionMessage && (
        <div className="alert-success" style={{ marginBottom: "1rem" }}>
          {actionMessage}
        </div>
      )}

      {/* Summary Statistics Bar */}
      <div className="asset-summary">
        <div>
          <strong>{assets.length}</strong>
          <span>Total in Library</span>
        </div>
        <div>
          <strong>{assets.filter((a) => (a.assetType || "").toUpperCase() === "IMAGE").length}</strong>
          <span>Images</span>
        </div>
        <div>
          <strong>{assets.filter((a) => (a.assetType || "").toUpperCase() === "VIDEO").length}</strong>
          <span>Videos</span>
        </div>
        <div>
          <strong>{assets.filter((a) => (a.assetType || "").toUpperCase() === "AUDIO").length}</strong>
          <span>Audio</span>
        </div>
        <div>
          <strong>{assets.filter((a) => (a.status || "").toUpperCase() === "PUBLISHED").length}</strong>
          <span>Published</span>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="asset-toolbar">
        <div className="asset-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by title, description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Dynamic Category Filter */}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories ({categories.length})</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName} ({cat.assetCount ?? 0})
            </option>
          ))}
        </select>

        {/* Asset Type Filter */}
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Video</option>
          <option value="AUDIO">Audio</option>
        </select>

        {/* Status Filter */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Sort By */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title (A-Z)</option>
          <option value="size">File Size (Largest)</option>
        </select>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={view === "grid" ? "view-active" : ""}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            ▦
          </button>
          <button
            className={view === "list" ? "view-active" : ""}
            onClick={() => setView("list")}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="asset-results-header">
        <span>Showing {filteredAssets.length} of {assets.length} assets</span>
        <button className="link-button" onClick={fetchData} title="Refresh Assets">
          ⟳ Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading digital assets from MySQL...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>{error}</h3>
          <button className="primary-button" onClick={fetchData}>
            Retry
          </button>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="empty-state">
          <span>⌕</span>
          <h3>No assets found</h3>
          <p>Try adjusting your search query, type, or category filter.</p>
        </div>
      ) : (
        <div className={`asset-cards ${view === "list" ? "list-view" : ""}`}>
          {filteredAssets.map((asset) => {
            const assetId = asset.assetId || asset.id;
            const previewUrl = getAssetPreviewUrl(assetId);
            const downloadUrl = getAssetDownloadUrl(assetId);

            return (
              <div className="asset-card" key={assetId}>
                {/* Visual Preview */}
                <div
                  className="asset-preview-container"
                  onClick={() => setSelectedAsset(asset)}
                  style={{ cursor: "pointer" }}
                  title="Click to view details & full preview"
                >
                  <img
                    src={previewUrl}
                    alt={asset.title}
                    className="asset-preview-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="asset-preview-fallback" style={{ display: "none" }}>
                    <span>{asset.assetType === "VIDEO" ? "🎬" : asset.assetType === "AUDIO" ? "🎧" : "🖼️"}</span>
                  </div>
                  <span className={getBadgeTypeClass(asset.assetType)}>
                    {asset.type || asset.assetType}
                  </span>
                </div>

                {/* Card Body */}
                <div className="asset-card-content">
                  <div className="asset-card-title">
                    <h3 onClick={() => setSelectedAsset(asset)} style={{ cursor: "pointer" }} title={asset.title}>
                      {asset.title || asset.name}
                    </h3>
                    <div className="asset-card-actions">
                      <a
                        href={downloadUrl}
                        download
                        className="asset-action-btn"
                        title="Download original file"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⬇
                      </a>
                      <button
                        className="asset-action-btn"
                        title="Edit asset metadata"
                        onClick={() => onEditAsset && onEditAsset(asset)}
                      >
                        ✏️
                      </button>
                      <button
                        className="asset-action-btn delete-btn"
                        title="Delete asset"
                        onClick={() => setDeleteConfirmAsset(asset)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="asset-meta">
                    <span>{asset.categoryName || "Uncategorized"}</span>
                    <span>·</span>
                    <span>{asset.formattedSize || "N/A"}</span>
                  </div>

                  {asset.tags && asset.tags.length > 0 && (
                    <div className="asset-tags-preview">
                      {asset.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="asset-tag-pill">
                          #{tag}
                        </span>
                      ))}
                      {asset.tags.length > 3 && (
                        <span className="asset-tag-more">+{asset.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="asset-card-footer">
                    <span className={getStatusClass(asset.status)}>
                      {asset.status || "Draft"}
                    </span>
                    <span className="asset-date">
                      {asset.createdAt
                        ? new Date(asset.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Added recently"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Detail & Preview Modal */}
      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-container asset-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAsset.title || selectedAsset.name}</h2>
              <button className="modal-close" onClick={() => setSelectedAsset(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body asset-detail-body">
              {/* Media Preview Box */}
              <div className="asset-modal-media">
                {selectedAsset.assetType === "AUDIO" ? (
                  <div className="media-player-box">
                    <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎧</span>
                    <audio controls src={getAssetPreviewUrl(selectedAsset.assetId || selectedAsset.id)} style={{ width: "100%" }} />
                  </div>
                ) : selectedAsset.assetType === "VIDEO" ? (
                  <video
                    controls
                    src={getAssetPreviewUrl(selectedAsset.assetId || selectedAsset.id)}
                    style={{ maxHeight: "320px", maxWidth: "100%", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={getAssetPreviewUrl(selectedAsset.assetId || selectedAsset.id)}
                    alt={selectedAsset.title}
                    style={{ maxHeight: "320px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                  />
                )}
              </div>

              {/* Metadata Table */}
              <div className="asset-modal-info">
                <div className="info-row">
                  <strong>Description:</strong>
                  <p>{selectedAsset.description || "No description provided."}</p>
                </div>

                <div className="info-grid">
                  <div>
                    <label>Asset ID</label>
                    <span>#{selectedAsset.assetId || selectedAsset.id}</span>
                  </div>
                  <div>
                    <label>Category</label>
                    <span>{selectedAsset.categoryName || "Uncategorized"}</span>
                  </div>
                  <div>
                    <label>Status</label>
                    <span className={getStatusClass(selectedAsset.status)}>
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div>
                    <label>Asset Type</label>
                    <span>{selectedAsset.assetType}</span>
                  </div>
                  <div>
                    <label>File Name</label>
                    <span>{selectedAsset.fileName || "N/A"}</span>
                  </div>
                  <div>
                    <label>File Size</label>
                    <span>{selectedAsset.formattedSize || "N/A"}</span>
                  </div>
                  <div>
                    <label>MIME Type</label>
                    <span>{selectedAsset.mimeType || "application/octet-stream"}</span>
                  </div>
                  <div>
                    <label>Created By</label>
                    <span>{selectedAsset.createdByName || "System"} ({selectedAsset.createdByRole || "User"})</span>
                  </div>
                  <div>
                    <label>Upload Date</label>
                    <span>{new Date(selectedAsset.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                  <div className="info-row" style={{ marginTop: "1rem" }}>
                    <strong>Associated Tags:</strong>
                    <div className="tag-chips-container">
                      {selectedAsset.tags.map((t, idx) => (
                        <span key={idx} className="asset-tag-pill">#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={getAssetDownloadUrl(selectedAsset.assetId || selectedAsset.id)}
                download
                className="primary-button"
              >
                ⬇ Download Original File
              </a>
              <button
                className="secondary-button"
                onClick={() => {
                  const toEdit = selectedAsset;
                  setSelectedAsset(null);
                  onEditAsset && onEditAsset(toEdit);
                }}
              >
                ✏️ Edit Metadata
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  setDeleteConfirmAsset(selectedAsset);
                  setSelectedAsset(null);
                }}
              >
                🗑 Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmAsset && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmAsset(null)}>
          <div className="modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Asset Deletion</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmAsset(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>"{deleteConfirmAsset.title}"</strong>?
              </p>
              <p style={{ color: "#ef4444", fontSize: "0.88rem", marginTop: "0.5rem" }}>
                This will permanently delete the asset record from MySQL and remove its physical file from storage.
              </p>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setDeleteConfirmAsset(null)}>
                Cancel
              </button>
              <button className="danger-button" onClick={() => handleDelete(deleteConfirmAsset)}>
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetLibrary;
