import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter, DrawerTitle } from "@/components/ui/drawer";
import { DrawerDescription } from "@/components/ui/drawer";
import { DrawerHeader } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type createInvoiceSchema } from "@/service/invoice";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
} from "@/service/product";
import { useGetAllProductPricesQuery } from "@/service/product-price";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, SearchIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const ChooseProductDrawerContent: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  index: number;
  selectedProductId: string;
  onProductSelected: () => void;
}> = ({ form, index, selectedProductId, onProductSelected }) => {
  const [name, setName] = React.useState("");
  const deferredSearch = React.useDeferredValue(name);

  const getAllProductsQuery = useGetAllProductsQuery({ q: deferredSearch });
  const products = getAllProductsQuery.data?.data ?? [];

  const getAllProductPricesQuery = useGetAllProductPricesQuery();

  const createProductMutation = useCreateProductMutation();

  const onCreateProduct = async () => {
    if (!name) {
      toast.error("Product name is required");
      return;
    }

    const response = await createProductMutation.mutateAsync({
      name,
    });

    toast.success(`Product ${name} created`);

    form.setValue(`invoiceItems.${index}.productId`, response.data.id, {
      shouldValidate: true,
    });

    form.setValue(`invoiceItems.${index}.productName`, response.data.name, {
      shouldValidate: true,
    });

    form.setValue(
      `invoiceItems.${index}.price`,
      getAllProductPricesQuery.data?.data.find(
        (price) =>
          price.productId === response.data.id &&
          price.customerId === form.getValues("customerId"),
      )?.price ?? 0,
      { shouldValidate: true },
    );

    setName("");

    onProductSelected();
  };

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
        <DrawerTitle>Choose Product</DrawerTitle>
        <DrawerDescription>
          Choose a product to add to the invoice
        </DrawerDescription>

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
            {name ? (
              <Button
                variant="outline"
                onClick={onCreateProduct}
                className="w-full"
              >
                Add &quot;{name}&quot;
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onCreateProduct}
                className="w-full"
                disabled
              >
                No products found
              </Button>
            )}
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
                <Button
                  variant="ghost"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    form.setValue(
                      `invoiceItems.${index}.productId`,
                      product.id,
                      { shouldValidate: true },
                    );

                    form.setValue(
                      `invoiceItems.${index}.productName`,
                      product.name,
                      { shouldValidate: true },
                    );

                    form.setValue(
                      `invoiceItems.${index}.price`,
                      getAllProductPricesQuery.data?.data.find(
                        (price) =>
                          price.productId === product.id &&
                          price.customerId === form.getValues("customerId"),
                      )?.price ?? 0,
                      { shouldValidate: true },
                    );

                    onProductSelected();
                  }}
                >
                  {product.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      product.id === selectedProductId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </Button>
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
