import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { type createInvoiceSchema } from "@/service/invoice";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { CopyButton } from "./copy-button";

export const ReceiptSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
}> = ({ form }) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between">
          <div>Receipt</div>
          <CopyButton textToCopy={receipt} />
        </CardTitle>

        <section className="font-mono whitespace-pre-wrap">{receipt}</section>
      </CardHeader>
    </Card>
  );
};
