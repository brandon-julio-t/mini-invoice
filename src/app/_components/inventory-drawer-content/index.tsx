import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useGetAllProductsQuery } from "@/service/product";
import { useGetAllProductInventoriesQuery } from "@/service/product-inventory";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchIcon } from "lucide-react";
import React from "react";
import { InventoryDrawerAddProductForm } from "./add-product-form";
import { InventoryProductListItem } from "./list-item";

export const InventoryDrawerContent: React.ComponentType = () => {
  const [name, setName] = React.useState("");
  const deferredSearch = React.useDeferredValue(name);
  const getAllProductsQuery = useGetAllProductsQuery({ q: deferredSearch });

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

        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-(--text-base) -translate-y-1/2" />
          <Input
            className="pl-8"
            type="search"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search product..."
          />
        </div>
      </DrawerHeader>

      {/* The scrollable element for your list */}
      <div
        ref={parentRef}
        style={{
          height: "60vh",
          overflowY: "auto", // Make it scroll!
        }}
        className="border-y"
      >
        {products.length <= 0 && (
          <DrawerFooter>
            <Drawer
              open={openAddProductForm}
              onOpenChange={setOpenAddProductForm}
            >
              {name ? (
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Add &quot;{name}&quot;
                  </Button>
                </DrawerTrigger>
              ) : (
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full" disabled>
                    No products found in inventory
                  </Button>
                </DrawerTrigger>
              )}

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Add Product</DrawerTitle>
                  <DrawerDescription>
                    Add a new product to your inventory
                  </DrawerDescription>
                </DrawerHeader>

                <InventoryDrawerAddProductForm
                  defaultName={name}
                  onSuccess={() => {
                    setOpenAddProductForm(false);
                  }}
                />
              </DrawerContent>
            </Drawer>
          </DrawerFooter>
        )}

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

      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </React.Fragment>
  );
};
