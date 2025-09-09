import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our open_blinkist table structure
export interface BookAnalysisRecord {
  id?: number;
  created_at?: string;
  updated_at?: string;

  // Form input data
  book_name: string;
  author?: string;
  role: string;
  num_insights: number;

  // Response data
  response_data?: {
    book_name: string;
    author: string;
    role: string;
    key_insights: Array<{
      heading: string;
      bullet_points: string[];
      application?: string;
    }>;
    key_theme?: string;
  };

  // Metadata
  processing_time_ms?: number;
  api_endpoint?: string;
  user_ip?: string;
  user_agent?: string;
  status: "pending" | "completed" | "failed";
  error_message?: string;
}

// Helper function to save book analysis
export async function saveBookAnalysis(
  data: Omit<BookAnalysisRecord, "id" | "created_at" | "updated_at">
) {
  try {
    const { data: result, error } = await supabase
      .from("open_blinkist")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error saving book analysis:", error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error("Failed to save book analysis:", error);
    throw error;
  }
}

// Helper function to update book analysis with response
export async function updateBookAnalysisWithResponse(
  id: number,
  responseData: BookAnalysisRecord["response_data"],
  processingTimeMs?: number
) {
  try {
    const { data: result, error } = await supabase
      .from("open_blinkist")
      .update({
        response_data: responseData,
        processing_time_ms: processingTimeMs,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating book analysis:", error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error("Failed to update book analysis:", error);
    throw error;
  }
}

// Helper function to mark analysis as failed
export async function markAnalysisAsFailed(id: number, errorMessage: string) {
  try {
    const { data: result, error } = await supabase
      .from("open_blinkist")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error marking analysis as failed:", error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error("Failed to mark analysis as failed:", error);
    throw error;
  }
}

// Helper function to get book analysis history
export async function getBookAnalysisHistory(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from("open_blinkist")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching book analysis history:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch book analysis history:", error);
    throw error;
  }
}
