import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Delete Confirm State
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Unable to load categories from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      await createCategory({
        categoryName: newName.trim(),
        description: newDescription.trim() || null,
      });

      setSuccess(`Category "${newName.trim()}" created successfully!`);
      setNewName("");
      setNewDescription("");
      setTimeout(() => setSuccess(""), 4000);
      fetchCategories();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.categoryName);
    setEditDescription(cat.description || "");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCategory) return;

    try {
      setSubmitting(true);
      setError("");
      await updateCategory(editingCategory.categoryId, {
        categoryName: editName.trim(),
        description: editDescription.trim() || null,
      });

      setSuccess(`Category updated successfully!`);
      setEditingCategory(null);
      setTimeout(() => setSuccess(""), 4000);
      fetchCategories();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      await deleteCategory(cat.categoryId);
      setDeleteConfirmCat(null);
      setSuccess(`Category "${cat.categoryName}" deleted.`);
      setTimeout(() => setSuccess(""), 4000);
      fetchCategories();
    } catch (err) {
      alert(err.friendlyMessage || "Cannot delete category.");
      setDeleteConfirmCat(null);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      (cat.categoryName || "").toLowerCase().includes(q) ||
      (cat.description || "").toLowerCase().includes(q)
    );
  });

  const totalAssetsCount = categories.reduce(
    (acc, cat) => acc + (cat.assetCount || 0),
    0
  );

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>Organize digital content and manage asset categories in MySQL.</p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {/* Real Statistics */}
      <div className="categories-stats">
        <div className="category-stat-card">
          <span>Total Categories</span>
          <strong>{loading ? "..." : categories.length}</strong>
        </div>
        <div className="category-stat-card">
          <span>Categorized Assets</span>
          <strong>{loading ? "..." : totalAssetsCount}</strong>
        </div>
      </div>

      {/* Create Category Form */}
      <form className="category-create-form" onSubmit={handleAddCategory}>
        <h3>Create New Category</h3>
        <input
          type="text"
          placeholder="Category name (e.g. Corporate Videos)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? "Adding..." : "+ Add Category"}
        </button>
      </form>

      {/* Toolbar */}
      <div className="categories-toolbar">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>
          Showing {filteredCategories.length} of {categories.length} categories
        </span>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="empty-state">
          <p>Loading categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories found</h3>
          <p>Try a different search term or add a new category.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map((category) => (
            <div className="category-card" key={category.categoryId}>
              <div className="category-card-top">
                <span className="category-icon">📁</span>
                <div className="category-actions">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    title="Edit Category"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirmCat(category)}
                    title="Delete Category"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3>{category.categoryName}</h3>
              <p>{category.description || "No description provided."}</p>

              <div className="category-card-bottom">
                <span className="asset-count-badge">
                  {category.assetCount ?? 0} assets
                </span>
                <span className="cat-id-badge">ID #{category.categoryId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button className="modal-close" onClick={() => setEditingCategory(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <label style={{ marginTop: "1rem" }}>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCat && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmCat(null)}>
          <div className="modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Category</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmCat(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete category <strong>"{deleteConfirmCat.categoryName}"</strong>?
              </p>
              {deleteConfirmCat.assetCount > 0 ? (
                <div className="alert-error" style={{ marginTop: "0.75rem" }}>
                  ⚠️ This category currently has <strong>{deleteConfirmCat.assetCount} asset(s)</strong> attached.
                  You must reassign or delete those assets before deleting this category.
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.5rem" }}>
                  This category has 0 assets and can be safely removed.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setDeleteConfirmCat(null)}>
                Cancel
              </button>
              <button
                className="danger-button"
                disabled={deleteConfirmCat.assetCount > 0}
                onClick={() => handleDelete(deleteConfirmCat)}
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

export default Categories;
