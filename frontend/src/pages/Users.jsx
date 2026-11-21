import { useState, useEffect } from "react";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../services/api";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleId: "",
    password: "",
    status: "ACTIVE",
  });

  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, rolesRes] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      setUsers(usersRes.data || []);
      const r = rolesRes.data || [];
      setRoles(r);
      if (r.length > 0 && !formData.roleId) {
        setFormData((prev) => ({ ...prev, roleId: r[0].roleId }));
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to load users from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      roleId: roles[0]?.roleId || 2,
      password: "",
      status: "ACTIVE",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      roleId: user.roleId || roles[0]?.roleId || 2,
      password: "", // Keep blank unless updating
      status: user.status || "ACTIVE",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Full name and email are mandatory.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Password is required for new accounts.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingUser) {
        await updateUser(editingUser.userId, formData);
        setSuccess(`User "${formData.fullName}" updated successfully!`);
      } else {
        await createUser(formData);
        setSuccess(`User "${formData.fullName}" created with secure BCrypt credentials!`);
      }

      setShowModal(false);
      setTimeout(() => setSuccess(""), 4000);
      fetchUserData();
    } catch (err) {
      setError(err.friendlyMessage || "Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (user) => {
    try {
      await toggleUserStatus(user.userId);
      setSuccess(`Status changed for ${user.fullName}.`);
      setTimeout(() => setSuccess(""), 3000);
      fetchUserData();
    } catch (err) {
      alert("Failed to change status: " + (err.friendlyMessage || err.message));
    }
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser(user.userId);
      setDeleteConfirmUser(null);
      setSuccess(`User ${user.fullName} deleted.`);
      setTimeout(() => setSuccess(""), 4000);
      fetchUserData();
    } catch (err) {
      alert("Cannot delete user: " + (err.friendlyMessage || err.message));
      setDeleteConfirmUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.roleName || "").toLowerCase().includes(q)
    );
  });

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const inactiveCount = users.filter((u) => u.status !== "ACTIVE").length;

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage team members, roles, status, and credentials in MySQL.</p>
        </div>
        <button className="add-user-btn" onClick={handleOpenAdd}>
          + Add New User
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {/* Real Statistics */}
      <div className="users-stats">
        <div className="user-stat-card">
          <span>Total Users</span>
          <h2>{loading ? "..." : users.length}</h2>
        </div>
        <div className="user-stat-card">
          <span>Active Users</span>
          <h2>{loading ? "..." : activeCount}</h2>
        </div>
        <div className="user-stat-card">
          <span>Inactive / Suspended</span>
          <h2>{loading ? "..." : inactiveCount}</h2>
        </div>
      </div>

      {/* Toolbar */}
      <div className="users-panel">
        <div className="users-toolbar">
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-users">
                    Loading users from MySQL database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-users">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-mini">
                          {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <div>
                          <strong>{user.fullName}</strong>
                          <span className="user-id-text">ID #{user.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{user.email}</div>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{user.phone || "No phone"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${(user.roleName || "").toLowerCase()}`}>
                        {user.roleName || "User"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-pill ${user.status === "ACTIVE" ? "active" : "inactive"}`}
                        onClick={() => handleToggle(user)}
                        title="Click to toggle active/inactive status"
                      >
                        {user.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                      </button>
                    </td>
                    <td className="user-actions">
                      <button onClick={() => handleOpenEdit(user)} title="Edit user">
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(user)}
                        title="Delete user"
                        className="delete-icon"
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

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "Edit User Account" : "Add New User Account"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />

                <label style={{ marginTop: "1rem" }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@cms.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <label style={{ marginTop: "1rem" }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div>
                    <label>System Role *</label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    >
                      {roles.map((r) => (
                        <option key={r.roleId} value={r.roleId}>
                          {r.roleName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Account Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                <label style={{ marginTop: "1rem" }}>
                  {editingUser ? "Password (Leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? "Enter new password if updating" : "Enter account password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingUser
                    ? "Update Account"
                    : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmUser(null)}>
          <div className="modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete User</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Delete account for <strong>"{deleteConfirmUser.fullName}"</strong> ({deleteConfirmUser.email})?
              </p>
              <p style={{ color: "#ef4444", fontSize: "0.88rem", marginTop: "0.5rem" }}>
                Warning: If this user created existing assets, deleting the user may affect asset foreign keys.
              </p>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setDeleteConfirmUser(null)}>
                Cancel
              </button>
              <button className="danger-button" onClick={() => handleDelete(deleteConfirmUser)}>
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
