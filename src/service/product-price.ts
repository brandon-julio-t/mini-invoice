import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { z } from "zod";

export interface ProductPrice {
  id: string;
  productId: string;
  customerId: string;
  price: number;
}

export const useGetAllProductPricesQuery = () => {
  return useQuery({
    queryKey: ["productPrices"],
    queryFn: async () => {
      const productPrices = JSON.parse(
        localStorage.getItem("productPrices") ?? "[]",
      ) as ProductPrice[];

      return { data: productPrices };
    },
  });
};

export const upsertProductPriceSchema = z.object({
  productId: z.string(),
  customerId: z.string(),
  price: z.number(),
});

export const useUpsertProductPriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof upsertProductPriceSchema>) => {
      const productPrices = JSON.parse(
        localStorage.getItem("productPrices") ?? "[]",
      ) as ProductPrice[];

      let existingProductPrice = productPrices.find(
        (productPrice) =>
          productPrice.productId === params.productId &&
          productPrice.customerId === params.customerId,
      );

      if (existingProductPrice) {
        existingProductPrice.price = params.price;
        localStorage.setItem("productPrices", JSON.stringify(productPrices));
      } else {
        const createdProductPrice = {
          id: nanoid(),
          productId: params.productId,
          customerId: params.customerId,
          price: params.price,
        } satisfies ProductPrice;

        productPrices.push(createdProductPrice);

        localStorage.setItem("productPrices", JSON.stringify(productPrices));

        existingProductPrice = createdProductPrice;
      }

      return { data: existingProductPrice };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
    },
  });
};

export const useDeleteProductPriceByProductIdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { productId: string }) => {
      const productPrices = JSON.parse(
        localStorage.getItem("productPrices") ?? "[]",
      ) as ProductPrice[];

      const filteredProductPrices = productPrices.filter(
        (productPrice) => productPrice.productId !== params.productId,
      );

      localStorage.setItem(
        "productPrices",
        JSON.stringify(filteredProductPrices),
      );

      return { data: filteredProductPrices };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
    },
  });
};
