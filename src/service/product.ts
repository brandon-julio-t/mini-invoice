import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  useDeleteProductPriceByProductIdMutation,
  useGetAllProductPricesQuery,
} from "./product-price";
import { useDeleteProductInventoryByProductIdMutation } from "./product-inventory";

export interface Product {
  id: string;
  name: string;
}

export const useGetAllProductsQuery = (params: { q?: string } = {}) => {
  return useQuery({
    queryKey: ["products", params.q],
    queryFn: async () => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      const q = params.q?.toLowerCase() ?? "";
      const filteredProducts = q
        ? products.filter((product) => product.name.toLowerCase().includes(q))
        : products;

      return { data: filteredProducts };
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

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  const deleteProductPriceByProductId =
    useDeleteProductPriceByProductIdMutation();
  const deleteProductInventoryByProductId =
    useDeleteProductInventoryByProductIdMutation();

  return useMutation({
    mutationFn: async (params: { productId: string }) => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      const index = products.findIndex(
        (product) => product.id === params.productId,
      );

      if (index === -1) {
        throw new Error("Product not found");
      }

      const deletedProduct = products[index];

      await deleteProductPriceByProductId.mutateAsync({
        productId: params.productId,
      });

      await deleteProductInventoryByProductId.mutateAsync({
        productId: params.productId,
      });

      products.splice(index, 1);

      localStorage.setItem("products", JSON.stringify(products));

      return { data: deletedProduct };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
