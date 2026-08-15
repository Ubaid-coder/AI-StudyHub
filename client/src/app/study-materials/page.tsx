"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  BookOpen,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  HardDrive,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Tag,
} from "lucide-react";

import { getPdfs } from "@/services/pdf.service";
import { PdfSummary } from "@/types/pdf.types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

// Utility Functions
function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;

  const styles: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const defaultStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        styles[difficulty.toLowerCase()] || defaultStyle
      }`}
    >
      <Tag className="w-3 h-3" />
      {difficulty}
    </span>
  );
}

function PdfStatus({ status }: { status: PdfSummary["status"] }) {
  if (status === "completed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        AI Ready
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Analyzing...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3.5 h-3.5" />
        Failed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
      <Clock className="w-3.5 h-3.5" />
      Queued
    </div>
  );
}

interface PdfCardProps {
  pdf: PdfSummary;
  onOpen: () => void;
}

function PdfCard({ pdf, onOpen }: PdfCardProps) {
  const topicCount = pdf.topics?.length ?? 0;
  const formattedSize = formatBytes(pdf.size || 0);
  const formattedDate = formatDate(pdf.createdAt);

  return (
    <div className="group relative bg-[#181C24] border border-gray-800/80 rounded-2xl p-5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <PdfStatus status={pdf.status} />
            <DifficultyBadge difficulty={pdf.difficulty} />
          </div>
        </div>

        {/* Title and Filename */}
        <h3 className="font-semibold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {pdf.title || pdf.originalName}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1.5">
          <span className="truncate max-w-[180px]">{pdf.originalName}</span>
          <span>•</span>
          <span>{formattedSize}</span>
        </div>

        {/* Topics Preview */}
        {pdf.topics && pdf.topics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Topics ({topicCount})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pdf.topics.slice(0, 2).map((topic) => (
                <span
                  key={topic._id}
                  className="px-2 py-0.5 bg-[#1F242E] border border-gray-700/50 text-gray-300 text-[11px] rounded-md truncate max-w-[200px]"
                >
                  {topic.title}
                </span>
              ))}
              {topicCount > 2 && (
                <span className="px-1.5 py-0.5 bg-[#1F242E] text-gray-500 text-[11px] rounded-md">
                  +{topicCount - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 border-t border-gray-800/60 flex items-center justify-between gap-3">
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </span>

        <button
          onClick={onOpen}
          disabled={pdf.status !== "completed"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-600 text-blue-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600/10 disabled:hover:text-blue-400 transition-all text-xs font-semibold"
        >
          {pdf.status === "completed" ? (
            <>
              <span>Study</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <span>Processing</span>
          )}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-5 animate-pulse flex flex-col justify-between h-[240px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-gray-800" />
          <div className="w-20 h-5 bg-gray-800 rounded-full" />
        </div>
        <div className="h-5 bg-gray-800 rounded-md w-3/4 mb-2" />
        <div className="h-3 bg-gray-800/60 rounded-md w-1/2" />
      </div>
      <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
        <div className="h-3 bg-gray-800/60 rounded-md w-1/4" />
        <div className="h-8 bg-gray-800 rounded-xl w-20" />
      </div>
    </div>
  );
}

export default function StudyMaterialsPage() {
  const router = useRouter();
  const [pdfs, setPdfs] = useState<PdfSummary[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const loadPdfs = async () => {
    setIsFetching(true);
    try {
      const response = await getPdfs();
      setPdfs(response.data.pdfs);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      toast.error("Failed to load study materials.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadPdfs();
  }, [isAuthLoading, isAuthenticated]);

  // Filtered PDFs based on search & filters
  const filteredPdfs = useMemo(() => {
    return pdfs.filter((pdf) => {
      const titleMatch =
        pdf.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.originalName.toLowerCase().includes(searchQuery.toLowerCase());

      const topicMatch = pdf.topics?.some((topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesSearch = titleMatch || topicMatch;

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        pdf.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || pdf.status === selectedStatus;

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [pdfs, searchQuery, selectedDifficulty, selectedStatus]);

  // Summary Metrics
  const stats = useMemo(() => {
    const completed = pdfs.filter((p) => p.status === "completed").length;
    const totalTopics = pdfs.reduce(
      (acc, p) => acc + (p.topics?.length || 0),
      0
    );
    return { total: pdfs.length, completed, totalTopics };
  }, [pdfs]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#1F242E] text-[#F3F4F6] p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-800 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Study Materials
                </h1>
              </div>
              <p className="text-sm text-gray-400">
                Transform your uploaded documents into AI-powered interactive study guides.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPdfs}
                disabled={isFetching}
                className="p-3 rounded-xl bg-[#181C24] hover:bg-gray-800 border border-gray-800 text-gray-300 transition"
                title="Refresh materials"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => router.push("/study-materials/upload")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white transition font-medium text-sm shadow-lg shadow-blue-500/10"
              >
                <Plus className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {!isFetching && pdfs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Materials</p>
                  <p className="text-xl font-bold text-white">{stats.total}</p>
                </div>
              </div>

              <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">AI Analyzed</p>
                  <p className="text-xl font-bold text-white">{stats.completed}</p>
                </div>
              </div>

              <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Topics Extracted</p>
                  <p className="text-xl font-bold text-white">{stats.totalTopics}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {pdfs.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#181C24] p-3 rounded-2xl border border-gray-800/80">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search material or topic..."
                  className="w-full bg-[#1F242E] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 border border-gray-700/50 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter:</span>
                </div>

                {/* Difficulty Select */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-[#1F242E] text-xs text-gray-300 rounded-xl px-3 py-2 border border-gray-700/50 focus:outline-none focus:border-blue-500 transition capitalize"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {/* Status Select */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#1F242E] text-xs text-gray-300 rounded-xl px-3 py-2 border border-gray-700/50 focus:outline-none focus:border-blue-500 transition capitalize"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          )}

          {/* Skeleton Loader */}
          {isFetching && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Initial Empty State (No PDFs Uploaded) */}
          {!isFetching && pdfs.length === 0 && (
            <div className="border border-gray-800 bg-[#181C24] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl my-12">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No study materials uploaded
              </h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Upload your lecture notes, textbooks, or research papers in PDF format. AI StudyHub will analyze them and generate custom study topics.
              </p>
              <button
                onClick={() => router.push("/study-materials/upload")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium text-sm text-white shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Upload Your First PDF
              </button>
            </div>
          )}

          {/* Filter Empty State */}
          {!isFetching && pdfs.length > 0 && filteredPdfs.length === 0 && (
            <div className="border border-gray-800 bg-[#181C24] rounded-2xl p-10 text-center">
              <p className="text-gray-400 text-sm">
                No study materials match your search filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDifficulty("all");
                  setSelectedStatus("all");
                }}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* PDF Grid */}
          {!isFetching && filteredPdfs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPdfs.map((pdf) => (
                <PdfCard
                  key={pdf._id}
                  pdf={pdf}
                  onOpen={() => router.push(`/study-materials/${pdf._id}`)}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}