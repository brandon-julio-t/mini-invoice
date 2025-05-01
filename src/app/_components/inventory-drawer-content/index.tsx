import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypographyMuted } from "@/components/ui/typography";
import { useGetAllProductsQuery } from "@/service/product";
import { useGetAllProductInventoriesQuery } from "@/service/product-inventory";
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

      <ScrollArea className="h-[60vh]">
        <div className="flex flex-col">
          {products.length <= 0 ? (
            <TypographyMuted className="text-center">
              No products in inventory
            </TypographyMuted>
          ) : (
            products.map((product) => (
              <InventoryProductListItem product={product} key={product.id} />
            ))
          )}
        </div>
      </ScrollArea>
    </React.Fragment>
  );
};
