import { useState, useEffect } from "react";
import { getRoles, getPermissions, updateRolePermissions } from "../services/api";
import "./RolesPermissions.css";

function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activePermIds, setActivePermIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rolesRes, permsRes] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      const rList = rolesRes.data || [];
      const pList = permsRes.data || [];

      setRoles(rList);
      setAllPermissions(pList);

      if (rList.length > 0) {
        const initialRole = rList[0];
        setSelectedRoleId(initialRole.roleId);
        setActivePermIds((initialRole.permissions || []).map((p) => p.permissionId));
      }
    } catch (err) {
      console.error("Failed to load roles and permissions:", err);
      setError("Unable to load roles and permissions from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRoleId(role.roleId);
    setActivePermIds((role.permissions || []).map((p) => p.permissionId));
    setSuccess("");
    setError("");
  };

  const handleTogglePermission = (permissionId) => {
    setActivePermIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
    setSuccess("");
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    try {
      setSaving(true);
      setError("");
      await updateRolePermissions(selectedRoleId, activePermIds);
      setSuccess("Permissions updated and saved to MySQL successfully!");
      setTimeout(() => setSuccess(""), 4000);

      // Refresh roles data
      const rolesRes = await getRoles();
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err.friendlyMessage || "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const mod = perm.moduleName || "GENERAL";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const currentRole = roles.find((r) => r.roleId === selectedRoleId);

  return (
    <div className="roles-page">
      <div className="roles-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Configure role-based access control (RBAC) and permissions stored in MySQL.</p>
        </div>
        <button
          className="primary-button"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Saving Changes..." : "✓ Save Permissions"}
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      <div className="roles-layout">
        {/* Roles Sidebar / Tabs */}
        <div className="roles-sidebar">
          <h3>System Roles ({roles.length})</h3>
          <div className="roles-list">
            {loading ? (
              <p style={{ padding: "1rem", color: "#64748b" }}>Loading roles...</p>
            ) : (
              roles.map((role) => (
                <div
                  key={role.roleId}
                  className={`role-tab ${role.roleId === selectedRoleId ? "active" : ""}`}
                  onClick={() => handleSelectRole(role)}
                >
                  <div className="role-tab-top">
                    <strong>{role.roleName}</strong>
                    <span className="perm-count">
                      {role.permissions ? role.permissions.length : 0} perms
                    </span>
                  </div>
                  <p className="role-desc">{role.description || "System role"}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Configuration Area */}
        <div className="permissions-content">
          <div className="permissions-header-panel">
            <div>
              <h2>{currentRole?.roleName || "Selected Role"} Permissions</h2>
              <p>{currentRole?.description || "Select permissions to grant or revoke."}</p>
            </div>
            <span className="selected-perms-badge">
              {activePermIds.length} of {allPermissions.length} permissions active
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading permissions from database...</p>
            </div>
          ) : (
            <div className="permissions-groups">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <div className="permission-group" key={moduleName}>
                  <h4 className="module-title">{moduleName.replace(/_/g, " ")}</h4>
                  <div className="permissions-grid">
                    {perms.map((p) => {
                      const isGranted = activePermIds.includes(p.permissionId);
                      return (
                        <label
                          key={p.permissionId}
                          className={`permission-card ${isGranted ? "granted" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => handleTogglePermission(p.permissionId)}
                          />
                          <div className="perm-info">
                            <span className="perm-key">{p.permissionKey}</span>
                            <span className="perm-desc">{p.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;
