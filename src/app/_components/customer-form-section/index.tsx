import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { type createInvoiceSchema } from "@/service/invoice";
import { ChevronsUpDown } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { CustomersDrawerContent } from "./customers-drawer-content";

export const CustomerFormSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  onCustomerSelected: () => void;
}> = ({ form, onCustomerSelected }) => {
  const name = form.watch("customerName");

  const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>

              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {name || "Select customer"}
                      <ChevronsUpDown className="ml-auto opacity-50" />
                    </Button>
                  </FormControl>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Customers</DrawerTitle>
                    <DrawerDescription>
                      Select a customer to add to the invoice
                    </DrawerDescription>
                  </DrawerHeader>

                  <CustomersDrawerContent
                    form={form}
                    selectedCustomerId={field.value ?? ""}
                    onCustomerSelected={() => {
                      setOpen(false);
                      onCustomerSelected();
                    }}
                  />
                </DrawerContent>
              </Drawer>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardHeader>
    </Card>
  );
};
