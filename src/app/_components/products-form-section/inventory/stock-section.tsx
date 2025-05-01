import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type createInvoiceSchema } from "@/service/invoice";
import { useGetAllProductInventoriesQuery } from "@/service/product-inventory";
import { PencilIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ProductInventoryUpsertForm } from "./upsert-form";

export const ProductInventoryStockSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  index: number;
}> = ({ form, index }) => {
  const productId = form.watch(`invoiceItems.${index}.productId`) ?? "";
  const productName = form.watch(`invoiceItems.${index}.productName`);
  const usedQuantity = form.watch(`invoiceItems.${index}.quantity`);

  const getAllProductInventoriesQuery = useGetAllProductInventoriesQuery();

  const currentQuantity =
    getAllProductInventoriesQuery.data?.data.find(
      (inventory) => inventory.productId === productId,
    )?.currentQuantity ?? 0;

  const finalQuantity = currentQuantity - usedQuantity;

  const [open, setOpen] = React.useState(false);

  return (
    <section className="flex flex-col">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="justify-between">
            Current Stock: {Number(currentQuantity).toLocaleString()}
            <PencilIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <ProductInventoryUpsertForm
            productId={productId}
            productName={productName}
            currentQuantity={currentQuantity}
            onUpsertSuccess={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>

      <Button type="button" variant="ghost" className="justify-start">
        Used Stock: {Number(usedQuantity).toLocaleString()}
      </Button>

      <Button type="button" variant="ghost" className="justify-start">
        Final Stock: {Number(finalQuantity).toLocaleString()}
      </Button>
    </section>
  );
};
