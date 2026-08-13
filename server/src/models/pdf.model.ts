import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPdf extends Document {
  user: Types.ObjectId;

  originalName: string;
  storedName: string;
  filePath: string;

  mimeType: string;
  size: number;

  status: "uploaded" | "processing" | "completed" | "failed";

  title?: string;
  summary?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";

  topics: {
    title: string;
    description: string;
  }[];

  keyConcepts: string[];

  importantDefinitions: {
    term: string;
    definition: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const pdfSchema = new Schema<IPdf>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    storedName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "completed",
        "failed",
      ],
      default: "uploaded",
    },

    title: String,

    summary: String,

    difficulty: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
      ],
    },

    topics: [
      {
        title: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          required: true,
        },
      },
    ],

    keyConcepts: [
      {
        type: String,
      },
    ],

    importantDefinitions: [
      {
        term: {
          type: String,
          required: true,
        },

        definition: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPdf>("Pdf", pdfSchema);