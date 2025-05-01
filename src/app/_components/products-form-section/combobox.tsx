"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl, FormField } from "@/components/ui/form";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { type createInvoiceSchema } from "@/service/invoice";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
} from "@/service/product";
import { useGetAllProductPricesQuery } from "@/service/product-price";
import { Check, SearchIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const ProductCombobox: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  index: number;
}> = ({ form, index }) => {
  const getAllProductsQuery = useGetAllProductsQuery();
  const getAllProductPricesQuery = useGetAllProductPricesQuery();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const createProductMutation = useCreateProductMutation();

  const onAddNewProduct = async () => {
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
    setOpen(false);
  };

  const productId = form.watch(`invoiceItems.${index}.productId`);

  return (
    <FormField
      control={form.control}
      name={`invoiceItems.${index}.productName`}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button variant="outline" className="w-full justify-start">
                <SearchIcon />
                {field.value || "Choose product"}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <FormControl>
                <CommandInput
                  value={name}
                  onInput={(e) => setName(e.currentTarget.value)}
                />
              </FormControl>
              <CommandList>
                <CommandEmpty className="px-6">
                  {name ? (
                    <Button variant="outline" onClick={onAddNewProduct}>
                      Add &quot;{name}&quot;
                    </Button>
                  ) : (
                    <TypographyMuted>
                      No product found.
                      <br />
                      Type a product name to add it.
                    </TypographyMuted>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {getAllProductsQuery.data?.data.map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => {
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

                        setName("");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          productId === product.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {product.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};
