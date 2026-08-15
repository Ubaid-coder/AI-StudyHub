"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileText,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  ShieldAlert,
} from "lucide-react";

import { uploadPdf } from "@/services/pdf.service";
import { PdfDifficulty } from "@/types/pdf.types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MAX_FILE_SIZE_MB = 1*1024*1024*1024;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function UploadPdfPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [difficulty, setDifficulty] = useState<PdfDifficulty>("intermediate");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      // Pre-fill title field with stripped filename
      const defaultName = file.name.replace(/\.[^/.]+$/, "");
      setCustomTitle(defaultName);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a PDF file first.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      if (customTitle.trim()) {
        formData.append("title", customTitle.trim());
      }
      formData.append("difficulty", difficulty);

      const response = await uploadPdf(formData);
      
      toast.success("PDF uploaded successfully! Processing started.");
      
      // Redirect directly to the document details page
      const createdPdfId = response.data.pdf._id;
      router.push(`/study-materials/${createdPdfId}`);
    } catch (error: any) {
      console.error("Failed to upload PDF:", error);
      const message = error.response?.data?.message || "Failed to upload document.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#1F242E] text-[#F3F4F6] p-6 md:p-10 font-sans">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Top Bar Navigation */}
          <div>
            <button
              onClick={() => router.push("/study-materials")}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition group mb-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Materials
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Upload Study Material
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Upload your textbook, lecture notes, or slides to extract AI key concepts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Dropzone */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                    : "border-gray-800 bg-[#181C24] hover:border-gray-700 hover:bg-[#1A1F29]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">
                    Click to upload <span className="text-gray-400 font-normal">or drag and drop</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF files only (Max size: {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              </div>
            ) : (
              /* Selected File Preview Card */
              <div className="bg-[#181C24] border border-gray-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 truncate">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-rose-400 transition shrink-0"
                  title="Remove PDF"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Document Metadata Settings */}
            <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-6 space-y-6">
              {/* Document Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry - Chapter 4"
                  disabled={isUploading}
                  className="w-full bg-[#1F242E] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Target Difficulty Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  Target Difficulty Level
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {(["beginner", "intermediate", "advanced"] as PdfDifficulty[]).map(
                    (lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isUploading}
                        onClick={() => setDifficulty(lvl)}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold capitalize border transition text-center ${
                          difficulty === lvl
                            ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-sm"
                            : "bg-[#1F242E] border-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/study-materials")}
                disabled={isUploading}
                className="px-5 py-3 rounded-xl border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white transition text-xs font-semibold shadow-lg shadow-blue-500/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
    </ProtectedRoute>
  );
}