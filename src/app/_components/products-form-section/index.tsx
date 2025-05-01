"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type createInvoiceSchema } from "@/service/invoice";
import { PlusIcon, TrashIcon } from "lucide-react";
import React from "react";
import { type UseFieldArrayReturn, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ProductCombobox } from "./combobox";
import { ProductInventoryStockSection } from "./inventory/stock-section";

export const ProductsFormSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  fieldArray: UseFieldArrayReturn<
    z.infer<typeof createInvoiceSchema>,
    "invoiceItems",
    "_id"
  >;
  onAddProductRow: () => void;
}> = ({ form, fieldArray, onAddProductRow }) => {
  return (
    <Card>
      {fieldArray.fields.length <= 0 && (
        <CardHeader>
          <CardTitle className="text-center">No products</CardTitle>
          <CardDescription className="text-center">
            Please add at least one product
          </CardDescription>
        </CardHeader>
      )}

      {fieldArray.fields.map((field, index) => {
        return (
          <React.Fragment key={field._id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <ProductCombobox form={form} index={index} />

                <FormField
                  control={form.control}
                  name={`invoiceItems.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`invoiceItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ProductInventoryStockSection form={form} index={index} />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fieldArray.remove(index)}
                  className="w-full min-w-9"
                >
                  <TrashIcon />
                </Button>
              </div>
            </CardContent>

            <Separator className="my-4" />
          </React.Fragment>
        );
      })}

      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!form.getValues("customerId")}
          onClick={onAddProductRow}
        >
          <PlusIcon />
          Add product
        </Button>

        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};
