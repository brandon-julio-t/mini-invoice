import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { TypographyMuted } from "@/components/ui/typography";
import { useGetAllProductsQuery } from "@/service/product";
import { useGetAllProductInventoriesQuery } from "@/service/product-inventory";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PlusIcon } from "lucide-react";
import React from "react";
import { InventoryDrawerAddProductForm } from "./add-product-form";
import { InventoryProductListItem } from "./list-item";

export const InventoryDrawerContent: React.ComponentType = () => {
  const getAllProductsQuery = useGetAllProductsQuery();

  const getAllProductInventoriesQuery = useGetAllProductInventoriesQuery();

  const products = (getAllProductsQuery.data?.data ?? []).map((product) => {
    const productInventory = (
      getAllProductInventoriesQuery.data?.data ?? []
    ).find((inventory) => inventory.productId === product.id);

    return {
      ...product,
      productInventory,
    };
  });

  const [openAddProductForm, setOpenAddProductForm] = React.useState(false);

  // The scrollable element for your list
  const parentRef = React.useRef(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle>Inventory</DrawerTitle>
        <DrawerDescription>Manage your inventory here</DrawerDescription>
      </DrawerHeader>

      <section className="mb-2 flex justify-end px-2">
        <Drawer open={openAddProductForm} onOpenChange={setOpenAddProductForm}>
          <DrawerTrigger asChild>
            <Button variant="outline">
              <PlusIcon />
              Add Product
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add Product</DrawerTitle>
              <DrawerDescription>
                Add a new product to your inventory
              </DrawerDescription>
            </DrawerHeader>

            <InventoryDrawerAddProductForm
              onSuccess={() => {
                setOpenAddProductForm(false);
              }}
            />
          </DrawerContent>
        </Drawer>
      </section>

      {products.length <= 0 && (
        <TypographyMuted className="text-center">
          No products in inventory
        </TypographyMuted>
      )}

      {/* The scrollable element for your list */}
      <div
        ref={parentRef}
        style={{
          height: `60vh`,
          overflow: "auto", // Make it scroll!
        }}
      >
        {/* The large inner element to hold all of the items */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Only the visible items in the virtualizer, manually positioned to be in view */}
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const product = products[virtualItem.index];

            if (!product) {
              return null;
            }

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <InventoryProductListItem product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};
