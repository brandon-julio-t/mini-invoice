import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { z } from "zod";

export interface Product {
  id: string;
  name: string;
}

export const useGetAllProductsQuery = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      return { data: products };
    },
  });
};

export const createProductSchema = z.object({
  name: z.string(),
});

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createProductSchema>) => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      const createdProduct = {
        id: nanoid(),
        name: params.name,
      } satisfies Product;

      products.push(createdProduct);

      localStorage.setItem("products", JSON.stringify(products));

      return { data: createdProduct };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
