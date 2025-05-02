"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type createInvoiceSchema } from "@/service/invoice";
import { CheckCircle2Icon, PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { ProductFieldArrayItem } from "./field-array-item";

export const ProductsFormSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
}> = ({ form }) => {
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

  const items = form.watch("invoiceItems");

  return (
    <Card>
      <CardContent>
        <AnimatePresence>
          {items.map((field, index) => (
            <motion.div
              key={field._id}
              initial={{
                opacity: 0,
                scale: 0.98,
                height: 0,
                marginBottom: 0,
                filter: "blur(2px)",
              }}
              animate={{
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
            >
              <ProductFieldArrayItem
                form={form}
                index={index}
                onRemove={() => {
                  const prev = form.getValues("invoiceItems");
                  form.setValue(
                    "invoiceItems",
                    prev.filter((f) => f._id !== field._id),
                  );
                }}
                canRemove={items.length > 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!form.getValues("customerId")}
          onClick={() => {
            const prev = form.getValues("invoiceItems");
            form.setValue("invoiceItems", [
              ...prev,
              { productName: "", price: 0, quantity: 0, _id: nanoid() },
            ]);
          }}
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
