import React from "react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type createInvoiceSchema } from "@/service/invoice";
import { TrashIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ChooseProductDrawer } from "./choose-product-drawer";
import { ProductInventoryStockSection } from "./inventory/stock-section";
import { Separator } from "@/components/ui/separator";

export const ProductFieldArrayItem: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ form, index, onRemove, canRemove }) => {
  const hasSelectedProduct = !!form.watch(`invoiceItems.${index}.productId`);

  const id = React.useId();

  return (
    <motion.div
      initial={{
        id: "initial",
        opacity: 0,
        scale: 0.98,
        height: 0,
        marginBottom: 0,
        filter: "blur(2px)",
      }}
      animate={{
        id: "animate",
        opacity: 1,
        scale: 1,
        height: "auto",
        marginBottom: 16,
        filter: "blur(0px)",
      }}
      exit={{
        id: "exit",
        opacity: 0,
        scale: 0.98,
        height: 0,
        marginBottom: 0,
        filter: "blur(2px)",
      }}
      onAnimationComplete={(def) => {
        /** @docs https://github.com/orgs/react-hook-form/discussions/11379 */
        const isExit =
          typeof def === "object" && "id" in def && def.id === "exit";

        const items = form.getValues("invoiceItems");

        const isLastItem = index === items.length - 1;

        const shouldHandleFormAnimationBug =
          isExit && isLastItem && items.length > 1;

        if (shouldHandleFormAnimationBug) {
          onRemove();
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <ChooseProductDrawer form={form} index={index} />

        <AnimatePresence>
          {hasSelectedProduct && (
            <motion.div
              key={id}
              className="flex flex-col gap-2"
              initial={{
                opacity: 0,
                height: 0,
                scale: 0.98,
                filter: "blur(2px)",
              }}
              animate={{
                opacity: 1,
                height: "auto",
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                height: 0,
                scale: 0.98,
                filter: "blur(2px)",
              }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="w-full min-w-9"
          disabled={!canRemove}
        >
          <TrashIcon />
        </Button>

        <div className="-mx-6 mt-6">
          <Separator />
        </div>
      </div>
    </motion.div>
  );
};
