import { useState, useEffect } from "react";
import { getActivities } from "../services/api";

function ActivityLogs() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (actionFilter !== "ALL") params.action = actionFilter;
      if (entityFilter !== "ALL") params.entityType = entityFilter;

      const res = await getActivities(params);
      setActivities(res.data || []);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
      setError("Unable to load activity logs from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [actionFilter, entityFilter]);

  const filteredActivities = activities.filter((act) => {
    const q = search.toLowerCase();
    const action = (act.action || "").toLowerCase();
    const details = (act.details || act.description || "").toLowerCase();
    const user = (act.userName || "").toLowerCase();
    const asset = (act.assetTitle || "").toLowerCase();

    return !q || action.includes(q) || details.includes(q) || user.includes(q) || asset.includes(q);
  });

  const getActionBadgeClass = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("UPLOAD") || act.includes("CREATE")) return "action-pill create";
    if (act.includes("PUBLISH")) return "action-pill publish";
    if (act.includes("UPDATE")) return "action-pill update";
    if (act.includes("DELETE")) return "action-pill delete";
    if (act.includes("LOGIN")) return "action-pill login";
    return "action-pill default";
  };

  const uploadCount = activities.filter((a) => (a.action || "").includes("UPLOAD")).length;
  const updateCount = activities.filter((a) => (a.action || "").includes("UPDATE")).length;
  const loginCount = activities.filter((a) => (a.action || "").includes("LOGIN")).length;

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div>
          <h1>Activity Logs</h1>
          <p>Real-time audit trail and system activity records stored in MySQL.</p>
        </div>
        <button className="secondary-button" onClick={fetchActivities} title="Refresh logs">
          ⟳ Refresh
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Real Statistics */}
      <div className="activity-log-stats">
        <div className="activity-log-stat-card">
          <h3>{loading ? "..." : activities.length}</h3>
          <p>Total Activity Events</p>
        </div>
        <div className="activity-log-stat-card">
          <h3>{loading ? "..." : uploadCount}</h3>
          <p>Asset Uploads</p>
        </div>
        <div className="activity-log-stat-card">
          <h3>{loading ? "..." : updateCount}</h3>
          <p>Updates & Edits</p>
        </div>
        <div className="activity-log-stat-card">
          <h3>{loading ? "..." : loginCount}</h3>
          <p>User Logins</p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="activity-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by action, details, user, or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="ALL">All Actions</option>
          <option value="USER_LOGIN">User Login</option>
          <option value="USER_LOGOUT">User Logout</option>
          <option value="ASSET_UPLOAD">Asset Upload</option>
          <option value="ASSET_UPDATE">Asset Update</option>
          <option value="ASSET_DELETE">Asset Delete</option>
          <option value="CATEGORY_CREATE">Category Create</option>
          <option value="CATEGORY_UPDATE">Category Update</option>
          <option value="CATEGORY_DELETE">Category Delete</option>
          <option value="TAG_CREATE">Tag Create</option>
          <option value="ROLE_PERMISSIONS_UPDATE">Role Permissions Update</option>
        </select>

        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
          <option value="ALL">All Entity Modules</option>
          <option value="ASSET">Asset</option>
          <option value="CATEGORY">Category</option>
          <option value="TAG">Tag</option>
          <option value="USER">User</option>
          <option value="ROLE">Role</option>
          <option value="AUTH">Auth</option>
        </select>
      </div>

      {/* Activities Table */}
      <div className="table-wrapper">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Details</th>
              <th>User</th>
              <th>Target Entity</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  Loading activity logs from database...
                </td>
              </tr>
            ) : filteredActivities.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No activity logs found matching the filter.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act) => (
                <tr key={act.id || act.activityId}>
                  <td>
                    <span className={getActionBadgeClass(act.action)}>
                      {act.type || act.action}
                    </span>
                  </td>
                  <td>
                    <div className="activity-details-text">
                      <strong>{act.details || act.description || "Activity logged"}</strong>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{act.userName || "System"}</strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
                        {act.userEmail || "user@" + act.userId}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="entity-chip">
                      {act.entityType} {act.assetTitle ? `· "${act.assetTitle}"` : ""}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {act.createdAt ? new Date(act.createdAt).toLocaleString() : "Database Seed"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActivityLogs;
