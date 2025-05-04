"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import {
  createInvoiceSchema,
  useCreateInvoiceMutation,
} from "@/service/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoxIcon, ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { BackupRestoreSection } from "./backup-restore-section";
import { CustomerFormSection } from "./customer-form-section";
import { InventoryDrawerContent } from "./inventory-drawer-content";
import { ProductsFormSection } from "./products-form-section";
import { ReceiptSection } from "./receipt-section";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PageView = () => {
  const form = useForm<z.infer<typeof createInvoiceSchema>>({
    mode: "onTouched",
    resolver: zodResolver(createInvoiceSchema),
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

  const { theme, setTheme } = useTheme();

  return (
    <main className="container my-4">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice</CardTitle>

              <CardDescription>
                Please fill in the details below to create an invoice
              </CardDescription>

              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <SunIcon />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <MoonIcon />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <ComputerIcon />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">
                    <BoxIcon />
                    Inventory
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <InventoryDrawerContent />
                </DrawerContent>
              </Drawer>

              <BackupRestoreSection />
            </CardContent>
          </Card>

          <CustomerFormSection form={form} />

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
                <ProductsFormSection form={form} />

                <ReceiptSection form={form} />
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </main>
  );
};
