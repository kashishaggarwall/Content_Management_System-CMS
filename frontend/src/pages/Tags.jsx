import { useState, useEffect } from "react";
import { getTags, createTag, updateTag, deleteTag } from "../services/api";
import "./Tags.css";

function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit tag state
  const [editingTag, setEditingTag] = useState(null);
  const [editTagName, setEditTagName] = useState("");

  // Delete confirm state
  const [deleteConfirmTag, setDeleteConfirmTag] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getTags();
      setTags(res.data || []);
    } catch (err) {
      console.error("Failed to load tags:", err);
      setError("Unable to load tags from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async (e) => {
    e.preventDefault();
    const name = newTag.trim().replace("#", "");
    if (!name) return;

    try {
      setSubmitting(true);
      setError("");
      await createTag({ tagName: name });
      setSuccess(`Tag #${name} created successfully!`);
      setNewTag("");
      setTimeout(() => setSuccess(""), 4000);
      fetchTags();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to create tag.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (tag) => {
    setEditingTag(tag);
    setEditTagName(tag.tagName);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const name = editTagName.trim().replace("#", "");
    if (!name || !editingTag) return;

    try {
      setSubmitting(true);
      setError("");
      await updateTag(editingTag.tagId, { tagName: name });
      setSuccess(`Tag updated to #${name}!`);
      setEditingTag(null);
      setTimeout(() => setSuccess(""), 4000);
      fetchTags();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to update tag.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tag) => {
    try {
      await deleteTag(tag.tagId);
      setDeleteConfirmTag(null);
      setSuccess(`Tag #${tag.tagName} deleted.`);
      setTimeout(() => setSuccess(""), 4000);
      fetchTags();
    } catch (err) {
      alert(err.friendlyMessage || "Cannot delete tag.");
      setDeleteConfirmTag(null);
    }
  };

  const filteredTags = tags.filter((t) =>
    (t.tagName || "").toLowerCase().includes(search.toLowerCase())
  );

  const usedTagsCount = tags.filter((t) => (t.usageCount || 0) > 0).length;
  const unusedTagsCount = tags.filter((t) => (t.usageCount || 0) === 0).length;

  return (
    <div className="tags-page">
      <div className="tags-header">
        <div>
          <h1>Tags</h1>
          <p>Organize, label, and discover digital assets using relational tags.</p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {/* Real Stats */}
      <div className="tags-stats">
        <div className="tags-stat-card">
          <span>Total Tags</span>
          <h2>{loading ? "..." : tags.length}</h2>
        </div>
        <div className="tags-stat-card">
          <span>Active in Assets</span>
          <h2>{loading ? "..." : usedTagsCount}</h2>
        </div>
        <div className="tags-stat-card">
          <span>Unused Tags</span>
          <h2>{loading ? "..." : unusedTagsCount}</h2>
        </div>
      </div>

      <div className="tags-panel">
        <div className="tags-toolbar">
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add Tag Form */}
        <form className="add-tag-form" onSubmit={handleAddTag}>
          <input
            type="text"
            placeholder="Enter new tag name (e.g. Festival)..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            disabled={submitting}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "+ Add Tag"}
          </button>
        </form>

        {/* Tags Table */}
        <div className="tags-table-wrapper">
          <table className="tags-table">
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Asset Association</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty-tags">
                    Loading tags from MySQL...
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-tags">
                    No tags found.
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => (
                  <tr key={tag.tagId}>
                    <td>
                      <span className="tag-chip">#{tag.tagName}</span>
                    </td>
                    <td>
                      <span className="usage-badge">
                        {tag.usageCount ?? 0} assets attached
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : "Database Seed"}
                    </td>
                    <td className="tag-actions">
                      <button onClick={() => handleOpenEdit(tag)} title="Edit Tag">
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTag(tag)}
                        title="Delete Tag"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTag && (
        <div className="modal-overlay" onClick={() => setEditingTag(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Tag</h2>
              <button className="modal-close" onClick={() => setEditingTag(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <label>Tag Name</label>
                <input
                  type="text"
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setEditingTag(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTag && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmTag(null)}>
          <div className="modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Tag</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmTag(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Delete tag <strong>"#{deleteConfirmTag.tagName}"</strong>?
              </p>
              {deleteConfirmTag.usageCount > 0 ? (
                <div className="alert-error" style={{ marginTop: "0.75rem" }}>
                  ⚠️ This tag is currently used by <strong>{deleteConfirmTag.usageCount} asset(s)</strong>.
                  Remove it from assets first before deleting.
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.5rem" }}>
                  This tag is not used by any asset and will be deleted safely.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setDeleteConfirmTag(null)}>
                Cancel
              </button>
              <button
                className="danger-button"
                disabled={deleteConfirmTag.usageCount > 0}
                onClick={() => handleDelete(deleteConfirmTag)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tags;
