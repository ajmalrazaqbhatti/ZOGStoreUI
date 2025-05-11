/********************************************************
 * UserManagement Component
 * Admin interface for managing user accounts
 ********************************************************/
import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Edit,
  AlertCircle,
  Check,
  X,
  User,
  Trash2,
  Save,
} from "lucide-react";
import overlay from "../../assets/overlay.png";
import useAuthCheck from "../../hooks/useAuthCheck";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

function UserManagement() {
  // Check admin authentication
  useAuthCheck();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    userId: null,
    username: "",
  });

  // User edit modal states
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /********************************************************
   * Data Fetching Functions
   ********************************************************/
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Get all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/admin/users", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search users by query
  const searchUsers = async (query) => {
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/search?query=${encodeURIComponent(query)}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Search failed");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  /********************************************************
   * Notification Functions
   ********************************************************/
  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3000);
  };

  // Hide toast notification
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /********************************************************
   * User Management Functions
   ********************************************************/
  // Show delete confirmation modal
  const confirmDeleteUser = (userId, username) => {
    setDeleteConfirm({
      show: true,
      userId,
      username,
    });
  };

  // Cancel user deletion
  const cancelDelete = () => {
    setDeleteConfirm({
      show: false,
      userId: null,
      username: "",
    });
  };

  // Delete user account
  const deleteUser = async () => {
    if (!deleteConfirm.userId) return;

    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/${deleteConfirm.userId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Remove user from state
      setUsers(users.filter((user) => user.user_id !== deleteConfirm.userId));
      showToast(`User deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(`Failed to delete user: ${error.message}`, "error");
    } finally {
      setDeleteConfirm({
        show: false,
        userId: null,
        username: "",
      });
    }
  };

  // Open user edit form
  const openUserEdit = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setShowUserEdit(true);
  };

  // Close user edit form
  const closeUserEdit = () => {
    setShowUserEdit(false);
    setEditUser(null);
    setEditForm({
      username: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field errors when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate user edit form
  const validateEditForm = () => {
    const errors = {};

    if (!editForm.username.trim()) {
      errors.username = "Username is required";
    }

    if (!editForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = "Email is invalid";
    }

    if (!editForm.role) {
      errors.role = "Role is required";
    }

    // Only validate password if it's provided
    if (editForm.password) {
      if (editForm.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (editForm.password !== editForm.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit user edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Update user info
      const userData = {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
      };

      const response = await fetch(
        `http://localhost:3000/admin/users/${editUser.user_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      // If password is provided, update the password separately
      if (editForm.password) {
        const passwordResponse = await fetch(
          `http://localhost:3000/admin/users/${editUser.user_id}/password`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword: editForm.password }),
          },
        );

        if (!passwordResponse.ok) {
          throw new Error("Failed to update password");
        }
      }

      // Update user in the list
      setUsers(
        users.map((user) =>
          user.user_id === editUser.user_id
            ? {
                ...user,
                username: editForm.username,
                email: editForm.email,
                role: editForm.role,
              }
            : user,
        ),
      );

      showToast("User updated successfully", "success");
      closeUserEdit();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast(`Failed to update user: ${error.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0B] text-white"
      style={{
        backgroundImage: `url(${overlay})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Toast Component */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8">
          {/* Delete Confirmation Modal */}
          {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1A1A1C] border border-white/10 rounded-3xl p-5 max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold mb-2">Delete User</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Are you sure you want to delete{" "}
                  <span className="text-white">{deleteConfirm.username}</span>?
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={cancelDelete}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteUser}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Edit Modal */}
          {showUserEdit && editUser && (
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-[#1A1A1C] border border-white/10 rounded-3xl max-w-md w-full mx-auto p-2">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#7C5DF9]/20 flex items-center justify-center">
                      <User size={16} className="text-[#7C5DF9]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Edit User</h3>
                      <p className="text-xs text-gray-400">
                        ID: {editUser.user_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeUserEdit}
                    className="text-white/70 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4">
                  <form onSubmit={handleEditSubmit}>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={editForm.username}
                            onChange={handleEditChange}
                            className={`w-full px-3 py-1.5 text-sm bg-black/30 border rounded-lg focus:outline-none focus:ring-1 ${
                              formErrors.username
                                ? "border-red-500/50 focus:ring-red-500/30"
                                : "border-white/10 focus:ring-[#7C5DF9]/50"
                            } cursor-pointer`}
                          />
                          {formErrors.username && (
                            <p className="mt-1 text-xs text-red-400">
                              {formErrors.username}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Role
                          </label>
                          <select
                            name="role"
                            value={editForm.role}
                            onChange={handleEditChange}
                            className={`w-full px-3 py-1.5 text-sm bg-black/30 border rounded-lg focus:outline-none focus:ring-1 ${
                              formErrors.role
                                ? "border-red-500/50 focus:ring-red-500/30"
                                : "border-white/10 focus:ring-[#7C5DF9]/50"
                            } cursor-pointer`}
                          >
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          {formErrors.role && (
                            <p className="mt-1 text-xs text-red-400">
                              {formErrors.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className={`w-full px-3 py-1.5 text-sm bg-black/30 border rounded-lg focus:outline-none focus:ring-1 ${
                            formErrors.email
                              ? "border-red-500/50 focus:ring-red-500/30"
                              : "border-white/10 focus:ring-[#7C5DF9]/50"
                          } cursor-pointer`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-red-400">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-medium">
                            Change Password
                          </h3>
                          <span className="text-gray-400 text-xs">
                            Optional
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={editForm.password}
                              onChange={handleEditChange}
                              className={`w-full px-3 py-1.5 text-sm bg-black/30 border rounded-lg focus:outline-none focus:ring-1 ${
                                formErrors.password
                                  ? "border-red-500/50 focus:ring-red-500/30"
                                  : "border-white/10 focus:ring-[#7C5DF9]/50"
                              } cursor-pointer`}
                            />
                            {formErrors.password && (
                              <p className="mt-1 text-xs text-red-400">
                                {formErrors.password}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={editForm.confirmPassword}
                              onChange={handleEditChange}
                              className={`w-full px-3 py-1.5 text-sm bg-black/30 border rounded-lg focus:outline-none focus:ring-1 ${
                                formErrors.confirmPassword
                                  ? "border-red-500/50 focus:ring-red-500/30"
                                  : "border-white/10 focus:ring-[#7C5DF9]/50"
                              } cursor-pointer`}
                            />
                            {formErrors.confirmPassword && (
                              <p className="mt-1 text-xs text-red-400">
                                {formErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={closeUserEdit}
                          className="px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/15 transition-colors text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-3 py-1.5 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <div className="h-3 w-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={12} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-400">
              Manage user accounts and permissions
            </p>
          </header>

          {/* Search Bar */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      fetchUsers();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-3xl p-4 mb-6 text-center">
              <p className="text-red-200 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
              <button
                className="mt-2 text-sm text-white/80 hover:text-white underline cursor-pointer"
                onClick={fetchUsers}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader size="large" logoSize="small" />
            </div>
          )}

          {/* Search in progress indicator */}
          {searching && !loading && (
            <div className="bg-[#7C5DF9]/10 border border-[#7C5DF9]/30 rounded-3xl p-4 mb-6 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#7C5DF9]"></div>
              <span className="text-[#7C5DF9]">Searching...</span>
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C5DF9]/20 rounded-full mb-4">
                    <User size={24} className="text-[#7C5DF9]" />
                  </div>
                  <h3 className="text-3xl font-medium mb-2">No users found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm
                      ? `No users match your search for "${searchTerm}"`
                      : "There are no users in the database"}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        fetchUsers();
                      }}
                      className="px-4 py-2 bg-[#7C5DF9] hover:bg-[#6A4FF0] rounded-3xl transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
                                <span className="text-[#7C5DF9]">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="font-medium">{user.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {user.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openUserEdit(user)}
                                className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  confirmDeleteUser(user.user_id, user.username)
                                }
                                className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
