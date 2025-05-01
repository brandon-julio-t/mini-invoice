"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TypographyMuted } from "@/components/ui/typography";
import {
  createInvoiceSchema,
  useCreateInvoiceMutation,
} from "@/service/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { CustomerFormSection } from "./customer-form-section";
import { ProductsFormSection } from "./products-form-section";

export const PageView = () => {
  const form = useForm<z.infer<typeof createInvoiceSchema>>({
    mode: "onTouched",
    resolver: zodResolver(createInvoiceSchema),
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "invoiceItems",
    keyName: "_id",
  });

  const createInvoiceMutation = useCreateInvoiceMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    await toast
      .promise(createInvoiceMutation.mutateAsync(data), {
        loading: "Creating invoice...",
        success: "Invoice created successfully",
        error: "Failed to create invoice",
      })
      .unwrap();
  });

  const receipt = [
    "Receipt",
    "-".repeat(32),
    "Customer: " + form.getValues("customerName"),
    "-".repeat(32),
    "Invoice Items:",
    ...(form.watch("invoiceItems")?.map((invoiceItem) => {
      const price = Number(invoiceItem.price);
      const quantity = Number(invoiceItem.quantity);
      const total = price * quantity;

      return `${invoiceItem.productName} Rp. ${price.toLocaleString()} x ${quantity.toLocaleString()} = Rp. ${total.toLocaleString()}`;
    }) ?? []),
    "-".repeat(32),
    "Total: Rp. " +
      form
        .watch("invoiceItems")
        ?.reduce(
          (acc, invoiceItem) =>
            acc + Number(invoiceItem.price) * Number(invoiceItem.quantity),
          0,
        )
        .toLocaleString(),
  ].join("\n");

  const onAddProductRow = () =>
    fieldArray.append({
      productName: "",
      price: 0,
      quantity: 0,
    });

  return (
    <main className="container my-4 max-w-sm">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice</CardTitle>
              <CardDescription>
                <TypographyMuted>
                  Please fill in the details below to create an invoice
                </TypographyMuted>
              </CardDescription>
            </CardHeader>
          </Card>

          <CustomerFormSection
            form={form}
            onCustomerSelected={() => {
              onAddProductRow();
            }}
          />

          <AnimatePresence>
            {form.watch("customerId") && (
              <motion.div
                initial={{
                  y: -8,
                  scale: 0.98,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  y: -8,
                  scale: 0.98,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                className="flex flex-col gap-4"
              >
                <ProductsFormSection
                  form={form}
                  fieldArray={fieldArray}
                  onAddProductRow={onAddProductRow}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-row items-center justify-between">
                      <div>Receipt</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(receipt);
                            toast.success("Copied to clipboard");
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to copy to clipboard");
                          }
                        }}
                      >
                        <CopyIcon />
                      </Button>
                    </CardTitle>

                    <section className="font-mono whitespace-pre-wrap">
                      {receipt}
                    </section>
                  </CardHeader>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </main>
  );
};
