"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FileText,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Bookmark,
  Layers,
  HelpCircle,
  Search,
  Tag,
  Download,
  Copy,
  Check,
} from "lucide-react";

import { getPdfById } from "@/services/pdf.service";
import { Pdf, PdfStatus as PdfStatusType } from "@/types/pdf.types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function StatusBadge({ status }: { status: PdfStatusType }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        AI Processing Complete
      </span>
    );
  }
  if (status === "processing" || status === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Analyzing Content...
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
      <AlertCircle className="w-3.5 h-3.5" />
      Analysis Failed
    </span>
  );
}

export default function StudyMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const pdfId = params?.id as string;

  const [pdf, setPdf] = useState<Pdf | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"summary" | "concepts" | "definitions" | "topics">("summary");
  const [definitionSearch, setDefinitionSearch] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPdfDetails = async (showLoading = true) => {
    if (!pdfId) return;
    if (showLoading) setIsLoading(true);

    try {
      const response = await getPdfById(pdfId);
      setPdf(response.data.pdf);
    } catch (error) {
      console.error("Failed to load PDF details:", error);
      toast.error("Failed to load study material details.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !pdfId) return;
    fetchPdfDetails(true);
  }, [pdfId, isAuthLoading, isAuthenticated]);

  // Polling mechanism if the document is still processing
  useEffect(() => {
    if (!pdf) return;
    if (pdf.status === "processing" || pdf.status === "uploaded") {
      const interval = setInterval(() => {
        fetchPdfDetails(false);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [pdf?.status]);

  const filteredDefinitions = useMemo(() => {
    if (!pdf?.importantDefinitions) return [];
    return pdf.importantDefinitions.filter(
      (def) =>
        def.term.toLowerCase().includes(definitionSearch.toLowerCase()) ||
        def.definition.toLowerCase().includes(definitionSearch.toLowerCase())
    );
  }, [pdf?.importantDefinitions, definitionSearch]);

  const handleCopySummary = () => {
    if (!pdf?.summary) return;
    navigator.clipboard.writeText(pdf.summary);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#1F242E] text-[#F3F4F6] p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 w-32 bg-gray-800 rounded-lg" />
            <div className="h-10 w-2/3 bg-gray-800 rounded-xl" />
            <div className="h-40 bg-[#181C24] border border-gray-800 rounded-2xl" />
            <div className="h-96 bg-[#181C24] border border-gray-800 rounded-2xl" />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!pdf) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#1F242E] text-[#F3F4F6] p-6 md:p-10 flex items-center justify-center">
          <div className="text-center max-w-md bg-[#181C24] p-8 rounded-2xl border border-gray-800">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Material Not Found</h2>
            <p className="text-sm text-gray-400 mb-6">
              The requested study document could not be found or you don't have permission to view it.
            </p>
            <button
              onClick={() => router.push("/study-materials")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
            >
              Back to Study Materials
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#1F242E] text-[#F3F4F6] p-6 md:p-10 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/study-materials")}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Materials
            </button>
            <StatusBadge status={pdf.status} />
          </div>

          {/* Document Header Card */}
          <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span>{pdf.originalName}</span>
                  <span>•</span>
                  <span>{formatBytes(pdf.size)}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {pdf.title || pdf.originalName}
                </h1>
              </div>

              {pdf.difficulty && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize self-start">
                  <Tag className="w-3.5 h-3.5" />
                  {pdf.difficulty} Level
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800/60 text-xs">
              <div>
                <span className="text-gray-500 block">Topics</span>
                <span className="font-semibold text-white text-sm">{pdf.topics?.length || 0} extracted</span>
              </div>
              <div>
                <span className="text-gray-500 block">Key Concepts</span>
                <span className="font-semibold text-white text-sm">{pdf.keyConcepts?.length || 0} concepts</span>
              </div>
              <div>
                <span className="text-gray-500 block">Definitions</span>
                <span className="font-semibold text-white text-sm">{pdf.importantDefinitions?.length || 0} terms</span>
              </div>
              <div>
                <span className="text-gray-500 block">Uploaded</span>
                <span className="font-semibold text-white text-sm">
                  {new Date(pdf.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Processing Banner if unfinished */}
          {(pdf.status === "processing" || pdf.status === "uploaded") && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4 text-amber-300">
              <Loader2 className="w-6 h-6 animate-spin shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold">AI is analyzing this material</p>
                <p className="text-amber-400/80">
                  Key concepts, topics, and definitions will update automatically as soon as processing completes.
                </p>
              </div>
            </div>
          )}

          {/* Tab Controls */}
          <div className="flex border-b border-gray-800 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-medium transition whitespace-nowrap ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Summary
            </button>

            <button
              onClick={() => setActiveTab("concepts")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-medium transition whitespace-nowrap ${
                activeTab === "concepts"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Key Concepts ({pdf.keyConcepts?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("definitions")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-medium transition whitespace-nowrap ${
                activeTab === "definitions"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Definitions ({pdf.importantDefinitions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("topics")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-medium transition whitespace-nowrap ${
                activeTab === "topics"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Topics ({pdf.topics?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {/* SUMMARY TAB */}
            {activeTab === "summary" && (
              <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">AI Overview</h2>
                  </div>
                  {pdf.summary && (
                    <button
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F242E] border border-gray-700/50 text-xs text-gray-300 hover:text-white transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>

                {pdf.summary ? (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {pdf.summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic py-6 text-center">
                    No summary generated yet.
                  </p>
                )}
              </div>
            )}

            {/* CONCEPTS TAB */}
            {activeTab === "concepts" && (
              <div className="space-y-3">
                {pdf.keyConcepts && pdf.keyConcepts.length > 0 ? (
                  pdf.keyConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181C24] border border-gray-800/80 rounded-xl p-4 flex items-start gap-3.5"
                    >
                      <div className="p-1 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">{concept}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    No key concepts available for this material.
                  </div>
                )}
              </div>
            )}

            {/* DEFINITIONS TAB */}
            {activeTab === "definitions" && (
              <div className="space-y-4">
                {pdf.importantDefinitions && pdf.importantDefinitions.length > 0 && (
                  <div className="relative w-full max-w-md">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={definitionSearch}
                      onChange={(e) => setDefinitionSearch(e.target.value)}
                      placeholder="Search terms or definitions..."
                      className="w-full bg-[#181C24] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 border border-gray-800 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {filteredDefinitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDefinitions.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-5 space-y-2 hover:border-gray-700 transition"
                      >
                        <h3 className="text-sm font-semibold text-blue-400">{item.term}</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    {pdf.importantDefinitions?.length === 0
                      ? "No definitions extracted for this document."
                      : "No definitions match your search term."}
                  </div>
                )}
              </div>
            )}

            {/* TOPICS TAB */}
            {activeTab === "topics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdf.topics && pdf.topics.length > 0 ? (
                  pdf.topics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181C24] border border-gray-800/80 rounded-2xl p-5 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Topic #{idx + 1}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{topic.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{topic.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-[#181C24] border border-gray-800/80 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    No topics extracted yet.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}