import {
  upsertProductInventorySchema,
  useGetAllProductInventoriesQuery,
  useUpsertProductInventoryMutation,
  type ProductInventory,
} from "@/service/product-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TypographyMuted } from "@/components/ui/typography";

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
      `${productName} initial stock has been updated to ${data.finalQuantity.toLocaleString()}`,
    );

    onUpsertSuccess();
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <header>
          <TypographyMuted className="text-sm text-muted-foreground">
            Current Quantity: {currentQuantity}
          </TypographyMuted>
        </header>

        <FormField
          control={form.control}
          name="finalQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Quantity</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          onClick={onSubmit}
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Save
        </Button>
      </form>
    </Form>
  );
};
