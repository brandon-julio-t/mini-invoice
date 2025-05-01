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
import { CheckCircle2Icon, CopyIcon, PlusIcon, TrashIcon } from "lucide-react";
import React from "react";
import { type UseFieldArrayReturn, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ChooseProductDrawer } from "./choose-product-drawer";
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
  const [submitButtomState, setSubmitButtomState] = React.useState<
    "idle" | "success"
  >("idle");

  const timeoutRef = React.useRef<number>(-1);

  React.useEffect(
    function handleFormSuccessfulSubmission() {
      if (form.formState.isSubmitSuccessful) {
        setSubmitButtomState("success");

        if (timeoutRef.current !== -1) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          setSubmitButtomState("idle");
        }, 2500);
      }
    },
    [
      form.formState.isSubmitSuccessful,
      // not used, but needed to trigger the effect on every button click
      form.formState.submitCount,
    ],
  );

  return (
    <Card>
      <AnimatePresence>
        {fieldArray.fields.map((field, index) => {
          const hasSelectedProduct = !!form.watch(
            `invoiceItems.${index}.productId`,
          );

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

                if (shouldHandleFormAnimationBug) {
                  fieldArray.remove(index);
                }
              }}
            >
              <CardContent className="border-b pb-6">
                <div className="flex flex-col gap-2">
                  <ChooseProductDrawer form={form} index={index} />

                  {hasSelectedProduct && (
                    <>
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
                    </>
                  )}

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
            </motion.div>
          );
        })}
      </AnimatePresence>

      <CardFooter className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!form.getValues("customerId")}
          onClick={onAddProductRow}
          className="w-full"
        >
          <PlusIcon />
          Add product
        </Button>

        <Button
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {submitButtomState === "idle" ? (
              <motion.div
                key={submitButtomState}
                variants={VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                Save
              </motion.div>
            ) : (
              <motion.div
                key={submitButtomState}
                variants={VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-row items-center gap-2"
              >
                <CheckCircle2Icon />
                Success
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </CardFooter>
    </Card>
  );
};

const VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: -24,
    filter: "blur(2px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 24,
    filter: "blur(2px)",
  },
};
