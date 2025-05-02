import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { SlidingNumber } from "@/components/ui/sliding-number";
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
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="items-center justify-start"
          >
            Current Stock: <SlidingNumber value={currentQuantity} />
            <PencilIcon className="ml-auto" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <ProductInventoryUpsertForm
            productId={productId}
            productName={productName}
            currentQuantity={currentQuantity}
            onUpsertSuccess={() => setOpen(false)}
          />
        </DrawerContent>
      </Drawer>

      <Button type="button" variant="ghost" className="justify-start">
        Used Stock: <SlidingNumber value={usedQuantity} />
      </Button>

      <Button type="button" variant="ghost" className="justify-start">
        Final Stock: <SlidingNumber value={finalQuantity} />
      </Button>
    </section>
  );
};
