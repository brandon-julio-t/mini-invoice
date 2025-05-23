"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type createInvoiceSchema } from "@/service/invoice";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ChooseProductDrawerContent } from "./content";
import { SlidingNumber } from "@/components/ui/sliding-number";

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
          <FormLabel>
            Product
            <span className="flex flex-row items-center">
              #<SlidingNumber value={index + 1} />
            </span>
          </FormLabel>

          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <FormControl>
                <Button variant="outline" className="w-full justify-start">
                  <SearchIcon />
                  {productName || "Choose product"}
                  <ChevronsUpDownIcon className="ml-auto" />
                </Button>
              </FormControl>
            </DrawerTrigger>
            <DrawerContent>
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
