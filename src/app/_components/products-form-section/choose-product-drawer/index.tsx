"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type createInvoiceSchema } from "@/service/invoice";
import { SearchIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ChooseProductDrawerContent } from "./content";

export const ChooseProductDrawer: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  index: number;
}> = ({ form, index }) => {
  const [open, setOpen] = React.useState(false);

  const productName = form.watch(`invoiceItems.${index}.productName`);

  return (
    <FormField
      control={form.control}
      name={`invoiceItems.${index}.productId`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product</FormLabel>

          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <FormControl>
                <Button variant="outline" className="w-full justify-start">
                  <SearchIcon />
                  {productName || "Choose product"}
                </Button>
              </FormControl>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Choose Product</DrawerTitle>
                <DrawerDescription>
                  Choose a product to add to the invoice
                </DrawerDescription>
              </DrawerHeader>

              <ChooseProductDrawerContent
                form={form}
                index={index}
                selectedProductId={field.value ?? ""}
                onProductSelected={() => {
                  setOpen(false);
                }}
              />
            </DrawerContent>
          </Drawer>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
