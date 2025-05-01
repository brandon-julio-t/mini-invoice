import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { type Product } from "@/service/product";
import { type ProductInventory } from "@/service/product-inventory";
import React from "react";
import { ProductInventoryUpsertForm } from "../products-form-section/inventory/upsert-form";

export const InventoryProductListItem: React.ComponentType<{
  product: Product & { productInventory: ProductInventory | undefined };
}> = ({ product }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full flex-row justify-between"
        >
          <span>{product.name}</span>
          <span className="flex items-center">
            x
            <SlidingNumber
              value={product.productInventory?.currentQuantity ?? 0}
            />
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="container">
        <DrawerHeader>
          <DrawerTitle>Inventory Details</DrawerTitle>
          <DrawerDescription>
            Manage the inventory for &quot;{product.name}&quot;
          </DrawerDescription>
        </DrawerHeader>

        <ProductInventoryUpsertForm
          productId={product.id}
          productName={product.name}
          currentQuantity={product.productInventory?.currentQuantity ?? 0}
          onUpsertSuccess={() => {
            setOpen(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};
