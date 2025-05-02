import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  upsertProductInventorySchema,
  useUpsertProductInventoryMutation,
} from "@/service/product-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const ProductInventoryUpsertForm: React.ComponentType<{
  productId: string;
  productName: string;
  currentQuantity: number;
  onUpsertSuccess: () => void;
}> = ({ productId, productName, currentQuantity, onUpsertSuccess }) => {
  const upsertProductInventoryMutation = useUpsertProductInventoryMutation();

  const form = useForm<z.infer<typeof upsertProductInventorySchema>>({
    mode: "onTouched",
    resolver: zodResolver(upsertProductInventorySchema),
    defaultValues: { productId, finalQuantity: currentQuantity },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await upsertProductInventoryMutation.mutateAsync(data);

    toast.success(
      `${productName} current stock has been updated to ${data.finalQuantity.toLocaleString()}`,
    );

    onUpsertSuccess();
  });

  return (
    <Form {...form}>
      <DrawerHeader>
        <DrawerTitle>Update Stock</DrawerTitle>
        <DrawerDescription>
          Update the stock for &quot;{productName}&quot;
        </DrawerDescription>
      </DrawerHeader>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="px-4">
          <FormField
            control={form.control}
            name="finalQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Quantity</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormDescription>
                  Current Quantity: {currentQuantity}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DrawerFooter>
          <Button
            type="button"
            onClick={onSubmit}
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Save
          </Button>

          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </Form>
  );
};
