"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

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
      <AnimatePresence>
        {fieldArray.fields.map((field, index) => {
          return (
            <motion.div
              key={field._id}
              initial={{
                id: "initial",
                opacity: 0,
                scale: 0.98,
                y: -8,
                height: 0,
              }}
              animate={{
                id: "animate",
                opacity: 1,
                scale: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                id: "exit",
                opacity: 0,
                scale: 0.98,
                y: -8,
                height: 0,
              }}
              onAnimationComplete={(def) => {
                /** @docs https://github.com/orgs/react-hook-form/discussions/11379 */
                const isExit =
                  typeof def === "object" && "id" in def && def.id === "exit";

                const isLastItem = index === fieldArray.fields.length - 1;

                const shouldHandleFormAnimationBug =
                  isExit && isLastItem && fieldArray.fields.length > 1;

                console.log({
                  def,
                  isExit,
                  isLastItem,
                  shouldHandleFormAnimationBug,
                });

                if (shouldHandleFormAnimationBug) {
                  fieldArray.remove(index);
                }
              }}
            >
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
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fieldArray.remove(index)}
                    className="w-full min-w-9"
                    disabled={fieldArray.fields.length === 1}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </CardContent>

              <Separator className="my-4" />
            </motion.div>
          );
        })}
      </AnimatePresence>

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
