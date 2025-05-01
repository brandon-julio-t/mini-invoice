import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { type Customer, useGetAllCustomersQuery } from "@/service/customer";
import { type Product, useGetAllProductsQuery } from "@/service/product";
import {
  type ProductInventory,
  useGetAllProductInventoriesQuery,
} from "@/service/product-inventory";
import {
  type ProductPrice,
  useGetAllProductPricesQuery,
} from "@/service/product-price";
import {
  ArchiveRestoreIcon,
  DatabaseBackupIcon,
  Wand2Icon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const BackupRestoreSection = () => {
  const [restoreText, setRestoreText] = React.useState("");

  const getAllCustomersQuery = useGetAllCustomersQuery({ q: "" });
  const getAllProductsQuery = useGetAllProductsQuery();
  const getAllProductPricesQuery = useGetAllProductPricesQuery();
  const getAllProductInventoriesQuery = useGetAllProductInventoriesQuery();

  const onBackup = async () => {
    const backup = JSON.stringify({
      customers: getAllCustomersQuery.data?.data,
      products: getAllProductsQuery.data?.data,
      productPrices: getAllProductPricesQuery.data?.data,
      productInventories: getAllProductInventoriesQuery.data?.data,
    });

    try {
      await navigator.clipboard.writeText(backup);
      toast.success("Backup copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy backup to clipboard");
    }
  };

  const onRestore = () => {
    const parsedBackup = JSON.parse(restoreText) as {
      customers: Customer[];
      products: Product[];
      productPrices: ProductPrice[];
      productInventories: ProductInventory[];
    };

    console.log(parsedBackup);

    localStorage.setItem("customers", JSON.stringify(parsedBackup.customers));
    localStorage.setItem("products", JSON.stringify(parsedBackup.products));
    localStorage.setItem(
      "productPrices",
      JSON.stringify(parsedBackup.productPrices),
    );
    localStorage.setItem(
      "productInventories",
      JSON.stringify(parsedBackup.productInventories),
    );

    toast.success("Backup restored. Refreshing page...");

    window.location.reload();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Wand2Icon /> Backup & Restore
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col gap-2 px-4 pb-4">
        <DrawerHeader>
          <DrawerTitle>Backup & Restore</DrawerTitle>
          <DrawerDescription>Backup and restore your data</DrawerDescription>
        </DrawerHeader>

        <Button variant="outline" onClick={onBackup}>
          <DatabaseBackupIcon />
          Backup
        </Button>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">
              <ArchiveRestoreIcon />
              Restore
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-4">
            <DrawerHeader>
              <DrawerTitle>Restore</DrawerTitle>
              <DrawerDescription>
                Paste the copied text from backup button
              </DrawerDescription>
            </DrawerHeader>

            <ScrollArea>
              <div className="h-32">
                <Textarea
                  value={restoreText}
                  onChange={(e) => setRestoreText(e.target.value)}
                  className="h-32 resize-none"
                />
              </div>
            </ScrollArea>

            <DrawerFooter>
              <Button onClick={onRestore}>Restore</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DrawerContent>
    </Drawer>
  );
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={onBackup}>
        <DatabaseBackupIcon />
        Backup
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ArchiveRestoreIcon />
            Restore
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restore</DialogTitle>
            <DialogDescription>
              Paste the copied text from backup button
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
            className="max-h-64 resize-none"
          />

          <DialogFooter>
            <Button onClick={onRestore}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
