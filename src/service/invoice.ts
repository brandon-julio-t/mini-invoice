import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { z } from "zod";

import { useCreateCustomerMutation } from "./customer";
import { useCreateProductMutation } from "./product";
import { useUpsertProductPriceMutation } from "./product-price";
import {
  useGetAllProductInventoriesQuery,
  useUpsertProductInventoryMutation,
} from "./product-inventory";

interface Invoice {
  id: string;
  customerId: string;
}

interface InvoiceItem {
  invoiceId: string;
  productId: string;
  price: number;
  quantity: number;
}

export const invoiceItemSchema = z.object({
  productId: z.string().nullish(),
  productName: z.string(),
  price: z.coerce.number().min(1),
  quantity: z.coerce.number().min(1),
  _id: z.string(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().nullish(),
  customerName: z.string(),

  invoiceItems: z.array(invoiceItemSchema),
});

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  const createCustomerMutation = useCreateCustomerMutation();
  const createProductMutation = useCreateProductMutation();
  const upsertProductPriceMutation = useUpsertProductPriceMutation();
  const getAllProductInventoriesQuery = useGetAllProductInventoriesQuery();
  const upsertProductInventoryMutation = useUpsertProductInventoryMutation();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createInvoiceSchema>) => {
      const { customerName } = params;
      let customerId = params.customerId;
      if (!customerId) {
        const createdCustomer = await createCustomerMutation.mutateAsync({
          name: customerName,
        });

        customerId = createdCustomer.data.id;
      }

      const invoices = JSON.parse(
        localStorage.getItem("invoices") ?? "[]",
      ) as Invoice[];

      const createdInvoice = {
        id: nanoid(),
        customerId,
      } satisfies Invoice;

      invoices.push(createdInvoice);

      // NOTE: no need to save historical invoices
      // afraid user's local storage will explode
      // localStorage.setItem("invoices", JSON.stringify(invoices));

      const createdInvoiceItems: InvoiceItem[] = [];

      for (const invoiceItem of params.invoiceItems) {
        let productId = invoiceItem.productId;

        if (!productId) {
          const createdProduct = await createProductMutation.mutateAsync({
            name: invoiceItem.productName,
          });

          productId = createdProduct.data.id;
        }

        await upsertProductPriceMutation.mutateAsync({
          productId,
          customerId,
          price: invoiceItem.price,
        });

        const currentQuantity =
          getAllProductInventoriesQuery.data?.data.find(
            (inventory) => inventory.productId === productId,
          )?.currentQuantity ?? 0;

        await upsertProductInventoryMutation.mutateAsync({
          productId,
          finalQuantity: currentQuantity - invoiceItem.quantity,
        });

        createdInvoiceItems.push({
          productId,
          invoiceId: createdInvoice.id,
          price: invoiceItem.price,
          quantity: invoiceItem.quantity,
        });
      }

      const invoiceItems = JSON.parse(
        localStorage.getItem("invoiceItems") ?? "[]",
      ) as InvoiceItem[];

      invoiceItems.push(...createdInvoiceItems);

      // NOTE: no need to save historical invoice items
      // afraid user's local storage will explode
      // localStorage.setItem("invoiceItems", JSON.stringify(invoiceItems));

      return { data: createdInvoice };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
