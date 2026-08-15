import api from "@/lib/axios";

import {
  GetPdfsResponse,
  GetPdfResponse,
} from "@/types/pdf.types";

export const getPdfs = async () => {
  const response = await api.get<GetPdfsResponse>(
    "/pdfs"
  );

  return response.data;
};

export const getPdfById = async (id: string) => {
  const response = await api.get<GetPdfResponse>(
    `/pdfs/${id}`
  );

  return response.data;
};

// Add this to your services/pdf.service.ts
export const uploadPdf = async (formData: FormData) => {
  const response = await api.post<GetPdfResponse>("/pdfs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};