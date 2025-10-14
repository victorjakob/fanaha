"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";
import { formatISK } from "@/util/formatPrice";

export default function ManageClient({ initialPieces, section }) {
  const router = useRouter();
  const [pieces, setPieces] = useState(initialPieces);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, available, sold, commission
  const [sortBy, setSortBy] = useState("created_at"); // created_at, name, price
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter and sort pieces
  const filteredAndSortedPieces = pieces
    .filter((piece) => {
      // Search filter
      const matchesSearch = piece.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "available" && piece.status === "available") ||
        (filterStatus === "sold" && piece.status === "sold") ||
        (filterStatus === "commission" && piece.status === "commission");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "created_at") {
        compareValue = new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        compareValue = (a.price || 0) - (b.price || 0);
      } else if (sortBy === "year") {
        compareValue = (a.year || 0) - (b.year || 0);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const handleEdit = (piece) => {
    router.push(`/alchemy/${piece.slug}/edit`);
  };

  const handleDelete = (piece) => {
    setSelectedPiece(piece);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedId) => {
    // Optimistically update UI - remove the deleted piece immediately
    setPieces((prevPieces) => prevPieces.filter((p) => p.id !== deletedId));

    // Close modal and clear selection
    setIsDeleteModalOpen(false);
    setSelectedPiece(null);

    // Show success toast
    setToast({
      message: "Piece deleted successfully!",
      type: "success",
    });

    // Refresh to ensure server state is synced
    router.refresh();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div
      className="max-w-7xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          {section?.title || "Manage Art Pieces"}
        </h2>
        {section?.description && (
          <p className="text-zinc-600">{section.description}</p>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="commission">Commission</option>
          </select>

          {/* Create Button */}
          <Link
            href="/alchemy/create"
            className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </Link>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-zinc-600">
        Showing {filteredAndSortedPieces.length} of {pieces.length} pieces
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                  onClick={() => toggleSort("price")}
                >
                  Price (ISK) <SortIcon field="price" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                  onClick={() => toggleSort("year")}
                >
                  Year <SortIcon field="year" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                  onClick={() => toggleSort("created_at")}
                >
                  Created <SortIcon field="created_at" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {filteredAndSortedPieces.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No pieces found
                  </td>
                </tr>
              ) : (
                filteredAndSortedPieces.map((piece) => (
                  <tr
                    key={piece.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100">
                        {piece.images?.[0] && (
                          <Image
                            src={piece.images[0]}
                            alt={piece.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">
                        {piece.name}
                      </div>
                      <div className="text-sm text-zinc-500">{piece.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          piece.status === "available"
                            ? "bg-green-100 text-green-800"
                            : piece.status === "commission"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {piece.status === "available"
                          ? "Available"
                          : piece.status === "commission"
                          ? "Commission"
                          : "Sold"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                      {piece.price ? formatISK(piece.price) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                      {piece.dimensions || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                      {piece.year || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {new Date(piece.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(piece)}
                        className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(piece)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-zinc-200">
          {filteredAndSortedPieces.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500">
              No pieces found
            </div>
          ) : (
            filteredAndSortedPieces.map((piece) => (
              <div
                key={piece.id}
                className="p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    {piece.images?.[0] && (
                      <Image
                        src={piece.images[0]}
                        alt={piece.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 truncate mb-1">
                      {piece.name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate mb-2">
                      {piece.slug}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          piece.status === "available"
                            ? "bg-green-100 text-green-800"
                            : piece.status === "commission"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {piece.status === "available"
                          ? "Available"
                          : piece.status === "commission"
                          ? "Commission"
                          : "Sold"}
                      </span>
                      {piece.price && (
                        <span className="text-xs text-zinc-600 bg-zinc-100 px-2 py-1 rounded-full">
                          {formatISK(piece.price)}
                        </span>
                      )}
                      {piece.year && (
                        <span className="text-xs text-zinc-600 bg-zinc-100 px-2 py-1 rounded-full">
                          {piece.year}
                        </span>
                      )}
                    </div>

                    {piece.dimensions && (
                      <p className="text-xs text-zinc-500 mb-2">
                        {piece.dimensions}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(piece)}
                        className="flex-1 text-xs text-blue-600 hover:text-blue-900 font-medium py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(piece)}
                        className="flex-1 text-xs text-red-600 hover:text-red-900 font-medium py-2 px-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          piece={selectedPiece}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
