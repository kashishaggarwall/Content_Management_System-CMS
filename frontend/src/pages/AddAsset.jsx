import { useState, useEffect } from "react";
import { getCategories, uploadAsset, updateAsset } from "../services/api";

function AddAsset({ onUploadSuccess, editingAsset, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assetType: "IMAGE",
    categoryId: "",
    status: "DRAFT",
    tags: "",
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load real categories from MySQL
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        const cats = response.data || [];
        setCategories(cats);
        if (cats.length > 0 && !editingAsset) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].categoryId }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, [editingAsset]);

  // Populate form if editing
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        title: editingAsset.title || editingAsset.name || "",
        description: editingAsset.description || "",
        assetType: editingAsset.assetType || "IMAGE",
        categoryId: editingAsset.categoryId || (categories[0]?.categoryId || ""),
        status: editingAsset.status || "DRAFT",
        tags: Array.isArray(editingAsset.tags)
          ? editingAsset.tags.join(", ")
          : editingAsset.tags || "",
      });
      setFile(null);
      setFilePreview(null);
    } else {
      setFormData({
        title: "",
        description: "",
        assetType: "IMAGE",
        categoryId: categories[0]?.categoryId || "",
        status: "DRAFT",
        tags: "",
      });
      setFile(null);
      setFilePreview(null);
    }
  }, [editingAsset, categories]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    setError("");

    if (selected) {
      // Auto-detect asset type from file MIME
      if (selected.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, assetType: "IMAGE" }));
        setFilePreview(URL.createObjectURL(selected));
      } else if (selected.type.startsWith("video/")) {
        setFormData((prev) => ({ ...prev, assetType: "VIDEO" }));
        setFilePreview(null);
      } else if (selected.type.startsWith("audio/")) {
        setFormData((prev) => ({ ...prev, assetType: "AUDIO" }));
        setFilePreview(null);
      } else {
        setFilePreview(null);
      }

      // Auto-populate title if empty
      if (!formData.title.trim()) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
      }
    } else {
      setFilePreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Asset title is required.");
      return;
    }

    if (!editingAsset && !file) {
      setError("Please select a physical file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("assetType", formData.assetType);
      if (formData.categoryId) {
        payload.append("categoryId", formData.categoryId);
      }
      payload.append("status", formData.status);
      payload.append("tags", formData.tags);

      if (file) {
        payload.append("file", file);
      }

      let response;
      if (editingAsset) {
        response = await updateAsset(editingAsset.assetId || editingAsset.id, payload, true);
        setSuccess(`Asset "${response.data.title}" updated successfully!`);
      } else {
        response = await uploadAsset(payload);
        setSuccess(`Asset "${response.data.title}" uploaded & saved to database successfully!`);
      }

      // Brief delay so user sees success message before redirect
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }, 1200);

    } catch (err) {
      console.error("Upload/Update failed:", err);
      setError(err.friendlyMessage || "Failed to process asset upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  return (
    <div className="add-asset-page">
      <div className="add-asset-header">
        <div>
          <h1>{editingAsset ? "Edit Asset Metadata" : "Upload & Store Asset"}</h1>
          <p>
            {editingAsset
              ? "Update asset metadata or optionally replace its physical file."
              : "Upload a physical file and associate structured metadata into MySQL."}
          </p>
        </div>
        {onCancel && (
          <button className="secondary-button" onClick={onCancel}>
            ← Back to Asset Library
          </button>
        )}
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: "1.5rem" }}>{success}</div>}

      <form className="add-asset-form" onSubmit={handleSubmit}>
        {/* File Upload Section */}
        <div className="form-section">
          <h3>File Details</h3>

          <label>
            {editingAsset ? "Replace Physical File (Optional)" : "Select File *"}
          </label>
          <div className="file-dropzone">
            <input
              type="file"
              id="asset-file-input"
              onChange={handleFileChange}
              required={!editingAsset}
              disabled={uploading}
              className="file-input-hidden"
            />
            <label htmlFor="asset-file-input" className="file-dropzone-label">
              <span className="dropzone-icon">📁</span>
              <span className="dropzone-text">
                {file ? (
                  <strong>{file.name}</strong>
                ) : editingAsset?.fileName ? (
                  <span>Current: <strong>{editingAsset.fileName}</strong> (Click to choose new file)</span>
                ) : (
                  <span>Click to choose file or drag & drop (Max: 50 MB)</span>
                )}
              </span>
              {file && (
                <span className="dropzone-size">Size: {formatFileSize(file.size)}</span>
              )}
            </label>
          </div>

          {/* Instant Client Image Preview */}
          {filePreview && (
            <div className="instant-preview-container" style={{ marginTop: "1rem" }}>
              <span className="preview-label">Selected Image Preview:</span>
              <img
                src={filePreview}
                alt="Upload preview"
                style={{ maxHeight: "200px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="form-section">
          <h3>Asset Information</h3>

          <label>Asset Title *</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Summer Campaign Banner"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={uploading}
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Detailed description of this asset..."
            value={formData.description}
            onChange={handleChange}
            rows="3"
            disabled={uploading}
          />
        </div>

        {/* Classification */}
        <div className="form-section">
          <h3>Classification & Publishing</h3>

          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label>Asset Type *</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                disabled={uploading}
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
              </select>
            </div>

            <div>
              <label>Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={uploading}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label>Publishing Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={uploading}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label>Tags (Comma separated)</label>
              <input
                type="text"
                name="tags"
                placeholder="e.g. marketing, 4k, banner"
                value={formData.tags}
                onChange={handleChange}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="save-asset-btn"
            disabled={uploading}
          >
            {uploading
              ? "Saving & Uploading File..."
              : editingAsset
              ? "Update Asset Metadata"
              : "Upload & Save Asset"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAsset;
