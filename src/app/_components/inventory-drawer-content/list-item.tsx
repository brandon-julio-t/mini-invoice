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
import { SlidingNumber } from "@/components/ui/sliding-number";
import { type Product } from "@/service/product";
import { type ProductInventory } from "@/service/product-inventory";
import React from "react";
import { ProductInventoryUpsertForm } from "../products-form-section/inventory/upsert-form";
import { AnimatePresence, motion } from "motion/react";
import { TrashIcon } from "lucide-react";
import { useDeleteProductMutation } from "@/service/product";
import { toast } from "sonner";

export const InventoryProductListItem: React.ComponentType<{
  product: Product & { productInventory: ProductInventory | undefined };
}> = ({ product }) => {
  const [open, setOpen] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  const deleteProduct = useDeleteProductMutation();

  const onDeleteProductConfirmed = async () => {
    await toast
      .promise(
        deleteProduct.mutateAsync({
          productId: product.id,
        }),
        {
          loading: `Deleting product "${product.name}"...`,
          success: `Product "${product.name}" deleted successfully`,
          error: `Failed to delete product "${product.name}"`,
        },
      )
      .unwrap();

    setOpen(false);
    setShowDelete(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={(_, info) => {
          if (info.offset.x <= -50) {
            setShowDelete(true);
          }

          if (info.offset.x > 50) {
            setShowDelete(false);
          }
        }}
        className="flex flex-row items-center"
      >
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="flex flex-1 flex-row justify-between !px-4"
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

        <AnimatePresence>
          {showDelete && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
            >
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="mr-4 size-10"
                  >
                    <TrashIcon />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Delete Product</DrawerTitle>
                    <DrawerDescription>
                      Are you sure you want to delete &quot;{product.name}
                      &quot;?
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button
                      variant="destructive"
                      onClick={onDeleteProductConfirmed}
                      isLoading={deleteProduct.isPending}
                    >
                      Yes, delete
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        isLoading={deleteProduct.isPending}
                      >
                        No, cancel
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <DrawerContent>
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
