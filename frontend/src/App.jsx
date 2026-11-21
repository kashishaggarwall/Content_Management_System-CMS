import React, { useState, useEffect } from "react";
import "./App.css";

// Pages & Components
import Dashboard from "./pages/Dashboard";
import AssetLibrary from "./pages/AssetLibrary";
import AddAsset from "./pages/AddAsset";
import Categories from "./pages/Categories";
import Tags from "./pages/Tags";
import Users from "./pages/Users";
import RolesPermissions from "./pages/RolesPermissions";
import VersionHistory from "./pages/VersionHistory";
import ActivityLogs from "./pages/ActivityLogs";
import Login from "./components/Login";
import { logout } from "./services/api";

function App() {
  // Initialize user from localStorage (null if missing or invalid)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cms_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [editingAsset, setEditingAsset] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Sync state if user changes in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("cms_user");
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
    if (user?.userId) {
      try {
        await logout(user.userId);
      } catch (err) {
        console.warn("Logout notification error:", err);
      }
    }
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_user");
    setUser(null);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowLoginModal(false);
    setCurrentPage("Dashboard");
  };

  // If user explicitly logged out and no user exists, render full Login screen
  if (!user || showLoginModal) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Generate initials for avatar
  const getInitials = (name = "") => {
    if (!name) return "AU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="cms-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="brand"
          onClick={() => setCurrentPage("Dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="brand-icon">C</div>
          <div>
            <h2>ContentHub</h2>
            <span>Content Management</span>
          </div>
        </div>

        {/* WORKSPACE SECTION */}
        <div className="nav-section">
          <p className="nav-label">WORKSPACE</p>

          <div
            className={`nav-item ${currentPage === "Dashboard" ? "active" : ""}`}
            onClick={() => setCurrentPage("Dashboard")}
          >
            <span>▦</span> Dashboard
          </div>
          <div
            className={`nav-item ${currentPage === "Asset Library" ? "active" : ""}`}
            onClick={() => {
              setEditingAsset(null);
              setCurrentPage("Asset Library");
            }}
          >
            <span>▧</span> Asset Library
          </div>
          <div
            className={`nav-item ${currentPage === "Add Asset" ? "active" : ""}`}
            onClick={() => {
              setEditingAsset(null);
              setCurrentPage("Add Asset");
            }}
          >
            <span>＋</span> Upload Asset
          </div>
          <div
            className={`nav-item ${currentPage === "Categories" ? "active" : ""}`}
            onClick={() => setCurrentPage("Categories")}
          >
            <span>◫</span> Categories
          </div>
          <div
            className={`nav-item ${currentPage === "Tags" ? "active" : ""}`}
            onClick={() => setCurrentPage("Tags")}
          >
            <span>#</span> Tags
          </div>
        </div>

        {/* ADMINISTRATION SECTION */}
        <div className="nav-section">
          <p className="nav-label">ADMINISTRATION</p>

          <div
            className={`nav-item ${currentPage === "Users" ? "active" : ""}`}
            onClick={() => setCurrentPage("Users")}
          >
            <span>♙</span> Users
          </div>
          <div
            className={`nav-item ${
              currentPage === "Roles & Permissions" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("Roles & Permissions")}
          >
            <span>⚙</span> Roles & Permissions
          </div>
          <div
            className={`nav-item ${
              currentPage === "Version History" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("Version History")}
          >
            <span>◷</span> Version History
          </div>
          <div
            className={`nav-item ${
              currentPage === "Activity Logs" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("Activity Logs")}
          >
            <span>▤</span> Activity Logs
          </div>
        </div>

        {/* Sidebar Bottom: User Profile & Logout */}
        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="avatar">
              {getInitials(user.fullName || user.username)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <strong
                style={{
                  display: "block",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {user.fullName || user.username || "User"}
              </strong>
              <span
                className={`role-badge ${(user.roleName || "USER")
                  .toLowerCase()
                  .replace("role_", "")}`}
                style={{ marginTop: "2px" }}
              >
                {user.roleName || "USER"}
              </span>
            </div>
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
            title="Log out of CMS"
          >
            ➔ Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace / <strong>{currentPage}</strong>
          </div>
          <div className="topbar-right">
            <button
              className="icon-button"
              onClick={() => {
                setEditingAsset(null);
                setCurrentPage("Asset Library");
              }}
              title="Search Assets"
            >
              ⌕
            </button>
            <button
              className="icon-button"
              onClick={() => {
                setEditingAsset(null);
                setCurrentPage("Add Asset");
              }}
              title="Upload Asset"
            >
              ＋
            </button>
            <div
              className="avatar"
              onClick={() => setCurrentPage("Users")}
              title={`${user.fullName || user.username} (${user.roleName})`}
              style={{ cursor: "pointer" }}
            >
              {getInitials(user.fullName || user.username)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="page-body">
          {currentPage === "Dashboard" && (
            <Dashboard onNavigate={setCurrentPage} user={user} />
          )}

          {currentPage === "Asset Library" && (
            <AssetLibrary
              onUpload={() => {
                setEditingAsset(null);
                setCurrentPage("Add Asset");
              }}
              onEditAsset={(asset) => {
                setEditingAsset(asset);
                setCurrentPage("Add Asset");
              }}
            />
          )}

          {currentPage === "Add Asset" && (
            <AddAsset
              editingAsset={editingAsset}
              onUploadSuccess={() => {
                setEditingAsset(null);
                setCurrentPage("Asset Library");
              }}
              onCancel={() => {
                setEditingAsset(null);
                setCurrentPage("Asset Library");
              }}
            />
          )}

          {currentPage === "Categories" && <Categories />}
          {currentPage === "Tags" && <Tags />}
          {currentPage === "Users" && <Users />}
          {currentPage === "Roles & Permissions" && <RolesPermissions />}
          {currentPage === "Version History" && <VersionHistory />}
          {currentPage === "Activity Logs" && <ActivityLogs />}
        </div>
      </main>
    </div>
  );
}

export default App;
