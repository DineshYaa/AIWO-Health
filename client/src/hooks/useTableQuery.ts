import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface UseTableQueryOptions<T> {
  queryKey: any[];
  queryFn?: (params: { queryKey: any[] }) => Promise<T>;
  enabled?: boolean;
  errorMessage?: string;
}

export function useTableQuery<T>({ 
  queryKey, 
  queryFn, 
  enabled = true, 
  errorMessage = "Failed to load data" 
}: UseTableQueryOptions<T>) {
  const { toast } = useToast();

  const result = useQuery<T>({
    queryKey,
    queryFn: queryFn ? () => queryFn({ queryKey }) : undefined,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });

  // Show toast error notification when query fails - using useEffect to prevent infinite loops
  useEffect(() => {
    if (result.isError) {
      console.error('Table query error:', result.error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [result.isError, result.error, errorMessage, toast]);

  return result;
}
