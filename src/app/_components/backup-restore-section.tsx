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
import { Textarea } from "@/components/ui/textarea";
import { Customer, useGetAllCustomersQuery } from "@/service/customer";
import { Product, useGetAllProductsQuery } from "@/service/product";
import {
  ProductInventory,
  useGetAllProductInventoriesQuery,
} from "@/service/product-inventory";
import {
  ProductPrice,
  useGetAllProductPricesQuery,
} from "@/service/product-price";
import { ArchiveRestoreIcon, DatabaseBackupIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
export const BackupRestoreSection = () => {
  const [restoreText, setRestoreText] = React.useState("");
  const [open, setOpen] = React.useState(false);

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

    toast.success("Backup restored");

    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={onBackup}>
        <DatabaseBackupIcon />
        Backup
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ArchiveRestoreIcon />
            Restore
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore</DialogTitle>
            <DialogDescription>
              Paste the copied text from backup button
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={onRestore}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
