import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export interface ProductInventory {
  productId: string;
  currentQuantity: number;
}

export const useGetAllProductInventoriesQuery = () => {
  return useQuery({
    queryKey: ["productInventories"],
    queryFn: async () => {
      const productInventories = JSON.parse(
        localStorage.getItem("productInventories") ?? "[]",
      ) as ProductInventory[];

      return { data: productInventories };
    },
  });
};

export const upsertProductInventorySchema = z.object({
  productId: z.string(),
  finalQuantity: z.coerce.number().min(0),
});

export const useUpsertProductInventoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof upsertProductInventorySchema>) => {
      const productInventories = JSON.parse(
        localStorage.getItem("productInventories") ?? "[]",
      ) as ProductInventory[];

      const existingProductInventory = productInventories.find(
        (inventory) => inventory.productId === data.productId,
      );

      if (existingProductInventory) {
        existingProductInventory.currentQuantity = data.finalQuantity;
      } else {
        productInventories.push({
          productId: data.productId,
          currentQuantity: data.finalQuantity,
        });
      }

      localStorage.setItem(
        "productInventories",
        JSON.stringify(productInventories),
      );

      return { data: data };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productInventories"] });
    },
  });
};

export const useDeleteProductInventoryByProductIdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { productId: string }) => {
      const productInventories = JSON.parse(
        localStorage.getItem("productInventories") ?? "[]",
      ) as ProductInventory[];

      const filteredProductInventories = productInventories.filter(
        (productInventory) => productInventory.productId !== params.productId,
      );

      localStorage.setItem(
        "productInventories",
        JSON.stringify(filteredProductInventories),
      );

      return { data: filteredProductInventories };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productInventories"] });
    },
  });
};
