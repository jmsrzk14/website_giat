"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { toastSuccess, toastError } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateKategoriPage() {
  const router = useRouter();
  const createCategory = useCategoryStore((state) => state.createCategory);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!form.name || !form.description) {
      toastError("Semua field wajib diisi!");
      setLoading(false);
      return;
    }

    try {
      await createCategory(form);
      toastSuccess("Kategori berhasil dibuat.");
      router.push("/admin/kategori");
    } catch (error: any) {
      toastError(error.message || "Terjadi kesalahan saat membuat kategori.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tambah Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">Nama Kategori</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 mb-1 block">Deskripsi</label>
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
