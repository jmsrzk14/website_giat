"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import AutoTable from "@/components/ui/table";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { toastSuccess, toastError } from "@/lib/toast";
import Swal from "sweetalert2";

export default function KategoriPage() {
  const { categories, isLoading, fetchCategories, updateCategory, deleteCategory, pagination } =
    useCategoryStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const per_page = 10;

  useEffect(() => {
    fetchCategories({ page, per_page });
  }, [page, fetchCategories]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setPage(1);
      fetchCategories({ page: 1, per_page });
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchInput, fetchCategories, per_page]);

  const openEditModal = (item: any) => {
    setEditItem(item);
    setIsOpen(true);
    setIsAnimating(true);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      setEditItem(null);
    }, 200);
  };

  const filteredCategories = categories.filter((item) =>
    (item?.name || "").toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSaveEdit = async () => {
    if (!editItem) return;

    const result = await Swal.fire({
      title: "Simpan perubahan?",
      text: "Apakah Anda yakin ingin menyimpan perubahan ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await updateCategory(editItem.id, editItem);
        toastSuccess("Data kategori berhasil diperbarui");
        fetchCategories({ page, per_page, search: searchInput });
        closeModal();
      } catch (error: any) {
        toastError(error.message || "Gagal memperbarui data kuis");
      }
    }
  };

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: "Hapus kuis?",
      text: `Yakin menghapus kuis ${item.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(item.id);
        toastSuccess("Data kuis berhasil dihapus");

        if (categories.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchCategories({ page, per_page, search: searchInput });
        }
      } catch (error: any) {
        toastError(error.message || "Gagal menghapus kuis");
      }
    }
  };

  const fields = [
    { key: "name", label: "Nama Kategori" },
    { key: "description", label: "Deskripsi" },
  ];

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const currentPage = pagination.current_page;
    const totalPages = pagination.total_pages;
    const pages = [];

    const maxVisible = 10;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, maxVisible);
    }

    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
            title="Halaman sebelumnya"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setPage(1)}
                disabled={isLoading}
                className="hidden sm:flex px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium disabled:opacity-40"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="hidden sm:inline px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg border transition-all text-sm font-medium min-w-[40px] ${p === currentPage
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "border-gray-300 hover:bg-gray-100 text-gray-700"
                } disabled:opacity-40`}
            >
              {p}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="hidden sm:inline px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => setPage(totalPages)}
                disabled={isLoading}
                className="hidden sm:flex px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium disabled:opacity-40"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
            title="Halaman selanjutnya"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="text-sm text-gray-600 order-3 hidden sm:block">
          Halaman <span className="font-semibold">{currentPage}</span> dari{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .loading-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6 animate-slideInDown">
        <h1 className="text-3xl font-bold text-gray-800">Data Kategori</h1>
        <Link
          href="/admin/kategori/create"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition shadow hover:shadow-lg active:scale-95 duration-300 font-medium"
        >
          <Plus className="w-5 h-5" /> Tambah Kategori
        </Link>
      </div>

      <div className="mb-6 animate-fadeIn">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Kategori Kuis"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full text-gray-800 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

        </div>
        {searchInput && (
          <div className="mt-2 text-sm text-gray-600">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loading-pulse">Mencari...</span>
              </span>
            ) : (
              <span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="animate-fadeIn">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchInput ? "Tidak ada hasil ditemukan" : "Belum ada data kategori"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchInput
                ? `Tidak ditemukan kategori dengan kata kunci "${searchInput}"`
                : "Klik tombol Tambah Kategori untuk membuat data baru"}
            </p>
          </div>
        ) : (
          <AutoTable
            data={filteredCategories}
            fields={fields}
            onEdit={openEditModal}
            onDelete={handleDelete}
            page={page}
            perPage={per_page}
          />
        )}
      </div>

      {renderPagination()}

      {isOpen && editItem && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-200 ${isAnimating ? "opacity-100" : "opacity-0"
            }`}
          onClick={closeModal}
        >
          <div
            className={`bg-white p-6 rounded-xl shadow-xl w-full max-w-md transition-transform duration-200 ${isAnimating ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Kategori</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  placeholder="Contoh: Kategori A"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all active:scale-95 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 font-medium shadow-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}