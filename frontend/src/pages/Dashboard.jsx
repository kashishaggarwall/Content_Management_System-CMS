import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/api";

function Dashboard({ onNavigate, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Unable to load real-time dashboard data. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getActionDotClass = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("UPLOAD") || act.includes("CREATE")) return "purple-dot";
    if (act.includes("PUBLISH")) return "green-dot";
    if (act.includes("UPDATE")) return "blue-dot";
    if (act.includes("DELETE")) return "red-dot";
    return "orange-dot";
  };

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, <strong>{user?.fullName || "User"}</strong>! Here is your live content workspace overview.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="secondary-button" onClick={fetchStats} title="Refresh Live Data">
            ⟳ Refresh
          </button>
          <button className="primary-button" onClick={() => onNavigate("Add Asset")}>
            + Upload Asset
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: "1.5rem" }}>
          <span>{error}</span>
          <button onClick={fetchStats}>Retry</button>
        </div>
      )}

      {/* Real Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate("Asset Library")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Total Assets</span>
            <span className="stat-icon purple">▧</span>
          </div>
          <h2>{loading ? "..." : (stats?.totalAssets ?? 0)}</h2>
          <p>Across your digital library</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate("Asset Library")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Published</span>
            <span className="stat-icon green">↗</span>
          </div>
          <h2>{loading ? "..." : (stats?.publishedAssets ?? 0)}</h2>
          <p>Live and accessible assets</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate("Asset Library")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Drafts</span>
            <span className="stat-icon orange">◷</span>
          </div>
          <h2>{loading ? "..." : (stats?.draftAssets ?? 0)}</h2>
          <p>Pending review or publication</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate("Categories")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Categories</span>
            <span className="stat-icon blue">◫</span>
          </div>
          <h2>{loading ? "..." : (stats?.totalCategories ?? 0)}</h2>
          <p>Organizing your content</p>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="stats-grid secondary-stats" style={{ marginTop: "1rem" }}>
        <div className="stat-card mini" onClick={() => onNavigate("Users")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>System Users</span>
            <span className="stat-icon green">♙</span>
          </div>
          <h3>{loading ? "..." : (stats?.totalUsers ?? 0)} Accounts</h3>
        </div>

        <div className="stat-card mini" onClick={() => onNavigate("Tags")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Search Tags</span>
            <span className="stat-icon purple">#</span>
          </div>
          <h3>{loading ? "..." : (stats?.totalTags ?? 0)} Tags</h3>
        </div>

        <div className="stat-card mini" onClick={() => onNavigate("Asset Library")} style={{ cursor: "pointer" }}>
          <div className="stat-top">
            <span>Archived Assets</span>
            <span className="stat-icon orange">📁</span>
          </div>
          <h3>{loading ? "..." : (stats?.archivedAssets ?? 0)} Archived</h3>
        </div>
      </div>

      {/* Lower Dashboard Sections */}
      <div className="dashboard-grid">
        {/* Recent Assets Panel */}
        <section className="panel recent-assets">
          <div className="panel-header">
            <div>
              <h3>Recent Assets</h3>
              <p>Latest database content records</p>
            </div>
            <button className="view-all" onClick={() => onNavigate("Asset Library")}>
              View all →
            </button>
          </div>

          <div className="asset-list">
            {loading ? (
              <p style={{ padding: "1.5rem", color: "#64748b" }}>Loading recent assets...</p>
            ) : stats?.recentAssets && stats.recentAssets.length > 0 ? (
              stats.recentAssets.map((asset) => (
                <div
                  className="asset-row"
                  key={asset.id}
                  onClick={() => onNavigate("Asset Library")}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`file-icon ${(asset.type || "").toLowerCase()}`}>
                    {asset.type === "Image" ? "IMG" : asset.type === "Video" ? "VID" : "AUD"}
                  </div>
                  <div className="asset-info">
                    <strong>{asset.title || asset.name}</strong>
                    <span>
                      {asset.categoryName || "Uncategorized"} · {asset.formattedSize || "N/A"}
                    </span>
                  </div>
                  <span className={`status ${(asset.status || "Draft").toLowerCase()}`}>
                    {asset.status || "Draft"}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ padding: "1.5rem", color: "#64748b" }}>No assets found in database.</p>
            )}
          </div>
        </section>

        {/* Recent Activity Panel */}
        <section className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Audit records from MySQL</p>
            </div>
            <button className="view-all" onClick={() => onNavigate("Activity Logs")}>
              View all →
            </button>
          </div>

          <div className="activity-list">
            {loading ? (
              <p style={{ padding: "1.5rem", color: "#64748b" }}>Loading activity records...</p>
            ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div className="activity-item" key={act.id}>
                  <div className={`activity-dot ${getActionDotClass(act.action)}`}></div>
                  <div>
                    <strong>{act.type || act.action}</strong>
                    <p>{act.details || act.description || "Activity performed"}</p>
                    <span className="activity-meta">
                      by <strong>{act.userName || "System"}</strong> · {act.formattedDate || "Recent"} {act.formattedTime || ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "1.5rem", color: "#64748b" }}>No activity records yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Quick Access */}
      <section className="panel quick-access">
        <div className="panel-header">
          <div>
            <h3>Quick Actions & Navigation</h3>
            <p>Direct shortcuts to core system modules</p>
          </div>
        </div>

        <div className="quick-access-grid">
          <div className="quick-card" onClick={() => onNavigate("Asset Library")} style={{ cursor: "pointer" }}>
            <span className="quick-icon purple">▧</span>
            <strong>Asset Library</strong>
            <span>Browse, preview & download assets →</span>
          </div>
          <div className="quick-card" onClick={() => onNavigate("Add Asset")} style={{ cursor: "pointer" }}>
            <span className="quick-icon green">♧</span>
            <strong>Upload Asset</strong>
            <span>Store physical media with metadata →</span>
          </div>
          <div className="quick-card" onClick={() => onNavigate("Categories")} style={{ cursor: "pointer" }}>
            <span className="quick-icon blue">◫</span>
            <strong>Categories</strong>
            <span>Organize assets by category →</span>
          </div>
          <div className="quick-card" onClick={() => onNavigate("Version History")} style={{ cursor: "pointer" }}>
            <span className="quick-icon orange">◷</span>
            <strong>Version History</strong>
            <span>Track asset revisions & changes →</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
